import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import type { RootState } from "../app/store";
import clsx from "clsx";
import { removeFavorite } from "../app/animalsSlice";

export const FavoritesList: React.FC = () => {
	const dispatch = useDispatch();
	const { favorites, byName } = useSelector((state: RootState) => state.animals);

	const removeFromFavorites = (animalName: string) => {
		dispatch(removeFavorite(animalName));
	};

	const clearAllFavorites = () => {
		if (window.confirm("Вы уверены, что хотите удалить все избранные животные?")) {
			favorites.forEach(name => dispatch(removeFavorite(name)));
		}
	};

	if (!favorites.length) {
		return (
			<div className="mt-20 ml-5">
				<p className="text-gray-600 text-lg">У вас нет избранных животных 😢</p>
				<Link
					to="/animals"
					className="inline-block mt-4 text-blue-600 hover:text-blue-800 transition-colors"
				>
					← Найти животных
				</Link>
			</div>
		);
	}

	return (
		<div className="px-4 py-6 max-w-2xl mx-auto">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-gray-900">Избранные животные</h1>
				<p className="text-gray-600 mt-2">
					{`${favorites.length} ${getRussianPlural(favorites.length)}`}
				</p>
			</div>

			<ul className="space-y-3">
				{favorites.map((name) => {
					const animal = byName[name];
					if (!animal) return null;

					return (
						<li
							key={name}
							className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
						>
							<Link
								to={`/animals/${name}`}
								className="text-blue-600 hover:text-blue-800 flex-1 font-medium text-lg truncate mr-4"
								title={name}
							>
								{name}
							</Link>

							<div className="flex items-center space-x-3">
								<button
									onClick={() => removeFromFavorites(name)}
									className={clsx(
										"px-4 py-2 rounded-lg transition-colors font-medium border flex items-center",
										"bg-amber-600 text-white hover:bg-amber-700 border-amber-700"
									)}
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

			{favorites.length > 1 && (
				<div className="mt-6 flex justify-center">
					<button
						onClick={clearAllFavorites}
						className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium border border-red-700 flex items-center"
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
						Удалить все избранные
					</button>
				</div>
			)}
		</div>
	);
};

function getRussianPlural(count: number): string {
	if (count % 10 === 1 && count % 100 !== 11) {
		return 'животное';
	} else if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
		return 'животных';
	} else {
		return 'животных';
	}
}