import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { setAnimals, setLoading, setError, addFavorite, removeFavorite, removeAnimal as removeAnimalFromStore } from "../app/animalsSlice";
import type { RootState } from "../app/store";
import { useLazyGetAnimalsByLetterQuery } from "../app/animalsApi";
import type { Animal } from "../types/Animal";
import clsx from "clsx";

const letters = "abcdefghijklmnopqrstuvwxyz".split("");
const CACHE_TTL = 1000 * 60 * 60 * 24;
const PAGE_SIZE = 50;
const REMOVED_ANIMALS_KEY = "removed-animals";

export default function AllAnimalsLoader() {
	const dispatch = useDispatch();
	const animals = useSelector((state: RootState) => state.animals.allNames);
	const favorites = useSelector((state: RootState) => state.animals.favorites);
	const updatedAt = useSelector((state: RootState) => state.animals.updatedAt);
	const [trigger] = useLazyGetAnimalsByLetterQuery();
	const [page, setPage] = useState(1);
	const [removedAnimals, setRemovedAnimals] = useState<Set<string>>(new Set());

	// Load removed animals from localStorage on component mount
	useEffect(() => {
		const savedRemovedAnimals = localStorage.getItem(REMOVED_ANIMALS_KEY);
		if (savedRemovedAnimals) {
			try {
				const removedArray = JSON.parse(savedRemovedAnimals) as string[];
				setRemovedAnimals(new Set(removedArray));
			} catch (error) {
				console.warn("Failed to load removed animals from localStorage:", error);
			}
		}
	}, []);

	const filteredAnimals = animals.filter(animalName => !removedAnimals.has(animalName));
	const totalPages = Math.ceil(filteredAnimals.length / PAGE_SIZE);
	const start = (page - 1) * PAGE_SIZE;
	const end = start + PAGE_SIZE;
	const currentAnimals = filteredAnimals.slice(start, end);

	useEffect(() => {
		const now = Date.now();
		if (animals.length === 0 || !updatedAt || now - updatedAt >= CACHE_TTL) {
			const loadAllAnimals = async () => {
				dispatch(setLoading(true));
				dispatch(setError(null));

				try {
					const results = await Promise.all(
						letters.map(async (letter) => {
							try {
								const data = await trigger(letter).unwrap();
								return Array.isArray(data) ? data : [];
							} catch {
								return [];
							}
						})
					);

					const allAnimals: Animal[] = results
					.flat()
					.filter((item): item is Animal => !!item);

					dispatch(setAnimals(allAnimals));
				} catch (err: any) {
					dispatch(setError(err.message || "Failed to load animals"));
				} finally {
					dispatch(setLoading(false));
				}
			};

			loadAllAnimals();
		}
	}, [animals.length, updatedAt, dispatch, trigger]);

	const isFavorite = useCallback((animalName: string) => {
		return favorites.includes(animalName);
	}, [favorites]);

	const toggleFavorite = useCallback((animalName: string) => {
		if (isFavorite(animalName)) {
			dispatch(removeFavorite(animalName));
		} else {
			dispatch(addFavorite(animalName));
		}
	}, [dispatch, isFavorite]);

	const removeAnimal = useCallback((animalName: string) => {
		if (window.confirm(`Вы уверены, что хотите удалить "${animalName}" из списка?`)) {
			// Add to removed animals set
			const newRemovedAnimals = new Set(removedAnimals);
			newRemovedAnimals.add(animalName);
			setRemovedAnimals(newRemovedAnimals);

			const removedArray = Array.from(newRemovedAnimals);
			localStorage.setItem(REMOVED_ANIMALS_KEY, JSON.stringify(removedArray));

			dispatch(removeAnimalFromStore(animalName));

			if (isFavorite(animalName)) {
				dispatch(removeFavorite(animalName));
			}

			if (currentAnimals.length === 1 && page > 1) {
				setPage(1);
			}
		}
	}, [removedAnimals, dispatch, isFavorite, currentAnimals.length, page]);

	useEffect(() => {
		setPage(1);
	}, [filteredAnimals.length]);

	return (
		<div className="px-4 py-6 w-full bg-white text-gray-900">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-xl font-bold text-gray-800">
					Всего животных: {filteredAnimals.length}
				</h2>
			</div>

			<p className="mb-4 text-gray-600">
				{updatedAt ? `Обновлено: ${new Date(updatedAt).toLocaleString()}` : "Загрузка данных..."}
			</p>

			{animals.length === 0 ? (
				<div className="text-center py-8">
					<p className="text-gray-500 text-lg">Загрузка животных...</p>
				</div>
			) : filteredAnimals.length === 0 ? (
				<div className="text-center py-8">
					<p className="text-gray-500 text-lg mb-4">Все животные удалены</p>
				</div>
			) : (
				<>
					<ul className="space-y-3">
						{currentAnimals.map((animalName, index) => {
							const favorite = isFavorite(animalName);

							return (
								<li
									key={`${animalName}-${index}`}
									className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
								>
									<Link
										to={`/animals/${animalName}`}
										className="text-blue-600 hover:text-blue-800 flex-1 font-medium text-lg truncate mr-4"
										title={animalName}
									>
										{animalName}
									</Link>

									<div className="flex items-center space-x-3">
										<button
											onClick={() => toggleFavorite(animalName)}
											className={clsx(
												"px-4 py-2 rounded-lg transition-colors font-medium border flex items-center whitespace-nowrap",
												{
													"bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-600": favorite,
													"bg-white text-gray-700 hover:bg-gray-100 border-gray-300": !favorite
												}
											)}
										>
											{favorite ? (
												<>
													<svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
														<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
													</svg>
													В избранном
												</>
											) : (
												<>
													<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
													</svg>
													В избранное
												</>
											)}
										</button>

										<button
											onClick={() => removeAnimal(animalName)}
											className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 border-red-700 rounded-lg transition-colors font-medium border flex items-center whitespace-nowrap"
											title="Удалить животное из списка"
										>
											<svg
												className="w-4 h-4 mr-2"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
												/>
											</svg>
											Удалить
										</button>
									</div>
								</li>
							);
						})}
					</ul>

					{totalPages > 1 && (
						<div className="mt-6 flex flex-col sm:flex-row items-center gap-4 justify-center">
							<button
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page === 1}
								className={clsx(
									"px-4 py-2 rounded-lg transition-colors font-medium flex items-center",
									{
										"bg-blue-500 text-white hover:bg-blue-600": page !== 1,
										"bg-gray-300 text-gray-500 cursor-not-allowed": page === 1
									}
								)}
							>
								<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
								</svg>
								Назад
							</button>

							<span className="font-medium px-4 py-2 bg-gray-100 rounded-lg text-gray-700">
								Страница {page} из {totalPages}
							</span>

							<button
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
								disabled={page === totalPages}
								className={clsx(
									"px-4 py-2 rounded-lg font-medium flex items-center",
									{
										"bg-blue-500 text-white hover:bg-blue-600": page !== totalPages,
										"bg-gray-300 text-gray-500 cursor-not-allowed": page === totalPages
									}
								)}
							>
								Вперед
								<svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
								</svg>
							</button>
						</div>
					)}
				</>
			)}
		</div>
	);
}