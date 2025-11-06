import React from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../app/store";
import { addFavorite, removeFavorite } from "../app/animalsSlice";
import { useAnimalImageEnhanced } from "../hooks/useAnimalImage";

export const AnimalCardComponent: React.FC = () => {
	const { name } = useParams<{ name: string }>();
	const dispatch = useDispatch();
	const { byName, favorites } = useSelector((state: RootState) => state.animals);

	const animal = name ? byName[name] : null;
	const isFavorite = name ? favorites.includes(name) : false;

	// Use animal's own image first, fallback to API image
	const hasAnimalImage = Boolean(animal?.image);
	const { imageUrl: apiImageUrl, loading, error } = useAnimalImageEnhanced(
		animal?.name,
		animal?.taxonomy?.scientific_name
	);

	// Determine which image to display
	const displayImage = animal?.image || apiImageUrl;
	const imageSource = animal?.image ? "uploaded" : "api";

	if (!animal || !name) {
		return (
			<div className="p-4 max-w-4xl mx-auto">
				<h2 className="text-2xl font-bold text-gray-800 mb-4">Животное не найдено 😢</h2>
				<Link
					to="/animals"
					className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
				>
					<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
					</svg>
					Назад к списку животных
				</Link>
			</div>
		);
	}

	const toggleFavorite = () => {
		if (isFavorite) {
			dispatch(removeFavorite(name));
		} else {
			dispatch(addFavorite(name));
		}
	};

	const formatCharacteristicKey = (key: string): string => {
		const translations: { [key: string]: string } = {
			'kingdom': 'Царство',
			'phylum': 'Тип',
			'class': 'Класс',
			'order': 'Отряд',
			'family': 'Семейство',
			'genus': 'Род',
			'scientific_name': 'Научное название',
			'common_name': 'Обычное название',
			'number_of_species': 'Количество видов',
			'location': 'Место обитания',
			'diet': 'Питание',
			'habitat': 'Среда обитания',
			'lifespan': 'Продолжительность жизни',
			'weight': 'Вес',
			'length': 'Длина',
			'height': 'Высота',
			'color': 'Цвет',
			'skin_type': 'Тип кожи',
			'top_speed': 'Максимальная скорость',
			'main_prey': 'Основная добыча',
			'predators': 'Хищники',
			'group_behavior': 'Поведение в группе',
			'lifestyle': 'Образ жизни',
			'favorite_food': 'Любимая пища',
			'slogan': 'Описание',
			'biggest_threat': 'Главная угроза',
			'most_distinctive_feature': 'Отличительная особенность',
			'gestation_period': 'Период беременности',
			'age_of_sexual_maturity': 'Возраст полового созревания',
			'age_of_weaning': 'Возраст отлучения',
			'name_of_young': 'Название детеныша'
		};

		return translations[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
	};

	const formatCharacteristicValue = (key: string, value: any): string => {
		if (Array.isArray(value)) {
			return value.join(", ");
		}

		if (typeof value === 'string') {
			// Handle numeric values with units
			if (key.includes('weight') && !isNaN(Number(value))) {
				return `${value} кг`;
			}
			if ((key.includes('length') || key.includes('height')) && !isNaN(Number(value))) {
				return `${value} см`;
			}
			if (key.includes('lifespan') && !isNaN(Number(value))) {
				return `${value} лет`;
			}
			if (key.includes('speed') && !isNaN(Number(value))) {
				return `${value} км/ч`;
			}
		}

		return value?.toString() || "Неизвестно";
	};

	const getUnknownText = (section: string): string => {
		const texts: { [key: string]: string } = {
			taxonomy: "Информация о классификации отсутствует",
			characteristics: "Информация об особенностях отсутствует",
			locations: "Информация о местах обитания отсутствует"
		};
		return texts[section] || "Информация отсутствует";
	};

	return (
		<div className="p-4 max-w-6xl mx-auto">
			{/* Back Navigation */}
			<Link
				to="/animals"
				className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-6 text-sm sm:text-base"
			>
				<svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
				</svg>
				Назад к списку животных
			</Link>

			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
				<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 break-words">
					{animal.name}
				</h1>
				<div className="flex items-center gap-3">
					{hasAnimalImage && (
						<span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
							<svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
							</svg>
							Свое фото
						</span>
					)}
					<button
						onClick={toggleFavorite}
						className={`flex items-center px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${
							isFavorite
								? "bg-yellow-500 hover:bg-yellow-600 text-white"
								: "bg-gray-200 hover:bg-gray-300 text-gray-800"
						}`}
					>
						{isFavorite ? (
							<>
								<svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
									<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
								</svg>
								Убрать из избранного
							</>
						) : (
							<>
								<svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
								</svg>
								Добавить в избранное
							</>
						)}
					</button>
				</div>
			</div>

			{/* Image Section */}
			<div className="mb-8">
				{loading && !hasAnimalImage && (
					<div className="flex items-center justify-center h-48 sm:h-64 bg-gray-100 rounded-lg">
						<div className="text-center">
							<div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
							<p className="mt-2 text-gray-600 text-sm sm:text-base">Загружается изображение...</p>
						</div>
					</div>
				)}

				{error && !hasAnimalImage && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4">
						<p className="text-red-800 flex items-center text-sm sm:text-base">
							<svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
							</svg>
							Ошибка загрузки изображения: {error}
						</p>
					</div>
				)}

				{displayImage && (
					<div className="flex justify-center">
						<img
							src={displayImage}
							alt={animal.name}
							className="max-w-full h-auto max-h-96 object-contain rounded-lg shadow-md"
							onError={(e) => {
								// If uploaded image fails, try API image as fallback
								if (imageSource === "uploaded" && apiImageUrl) {
									e.currentTarget.src = apiImageUrl;
								} else {
									e.currentTarget.style.display = 'none';
								}
							}}
						/>
					</div>
				)}

				{!displayImage && !loading && (
					<div className="flex items-center justify-center h-48 sm:h-64 bg-gray-100 rounded-lg">
						<div className="text-center text-gray-500">
							<svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
							</svg>
							<p className="text-lg">Изображение не найдено</p>
							<p className="text-sm mt-1">Попробуйте добавить фото через форму создания</p>
						</div>
					</div>
				)}
			</div>

			{/* Content Grid */}
			<div className="grid lg:grid-cols-2 gap-6">
				{/* Taxonomy Section */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
					<h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 pb-2 border-b border-gray-200">
						Классификация
					</h3>
					{animal.taxonomy && Object.keys(animal.taxonomy).length > 0 ? (
						<dl className="space-y-2 sm:space-y-3">
							{Object.entries(animal.taxonomy).map(([key, value]) => (
								<div key={key} className="flex flex-col sm:flex-row sm:items-start">
									<dt className="text-sm font-medium text-gray-600 sm:w-2/5 mb-1 sm:mb-0 sm:pr-2 break-words">
										{formatCharacteristicKey(key)}:
									</dt>
									<dd className="text-gray-900 sm:w-3/5 break-words">
										{formatCharacteristicValue(key, value)}
									</dd>
								</div>
							))}
						</dl>
					) : (
						<p className="text-gray-500 text-sm sm:text-base">{getUnknownText('taxonomy')}</p>
					)}
				</div>

				{/* Characteristics Section */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
					<h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 pb-2 border-b border-gray-200">
						Особенности
					</h3>
					{animal.characteristics && Object.keys(animal.characteristics).length > 0 ? (
						<dl className="space-y-2 sm:space-y-3">
							{Object.entries(animal.characteristics).map(([key, value]) => (
								<div key={key} className="flex flex-col sm:flex-row sm:items-start">
									<dt className="text-sm font-medium text-gray-600 sm:w-2/5 mb-1 sm:mb-0 sm:pr-2 break-words">
										{formatCharacteristicKey(key)}:
									</dt>
									<dd className="text-gray-900 sm:w-3/5 break-words">
										{formatCharacteristicValue(key, value)}
									</dd>
								</div>
							))}
						</dl>
					) : (
						<p className="text-gray-500 text-sm sm:text-base">{getUnknownText('characteristics')}</p>
					)}
				</div>
			</div>

			{/* Locations Section */}
			{animal.locations && animal.locations.length > 0 && (
				<div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
					<h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 pb-2 border-b border-gray-200">
						Места обитания
					</h3>
					<div className="flex flex-wrap gap-2">
						{animal.locations.map((location, index) => (
							<span
								key={index}
								className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 break-words"
							>
								{location}
							</span>
						))}
					</div>
				</div>
			)}
		</div>
	);
};