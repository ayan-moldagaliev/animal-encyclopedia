import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";

export const MainPage: React.FC = () => {
	const { allNames, favorites } = useSelector((state: RootState) => state.animals);

	const stats = {
		totalAnimals: allNames.length,
		favoriteAnimals: favorites.length,
		featuredCategories: [
			{ name: "Млекопитающие", count: 120, icon: "🦁" },
			{ name: "Птицы", count: 85, icon: "🦅" },
			{ name: "Рыбы", count: 67, icon: "🐠" },
			{ name: "Рептилии", count: 45, icon: "🐍" },
		]
	};

	const features = [
		{
			icon: "🔍",
			title: "Поиск животных",
			description: "Найдите любое животное по названию с помощью удобного поиска и фильтрации"
		},
		{
			icon: "⭐",
			title: "Избранное",
			description: "Сохраняйте понравившихся животных в избранное для быстрого доступа"
		},
		{
			icon: "📷",
			title: "Фотографии",
			description: "Просматривайте качественные фотографии животных из разных источников"
		},
		{
			icon: "📚",
			title: "Подробная информация",
			description: "Изучайте классификацию, характеристики и места обитания животных"
		},
		{
			icon: "➕",
			title: "Добавление животных",
			description: "Создавайте собственные карточки животных с фотографиями и описаниями"
		},
		{
			icon: "💾",
			title: "Оффлайн доступ",
			description: "Все данные сохраняются локально и доступны без интернета"
		}
	];

	const recentAnimals = allNames.slice(0, 6);

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50">
			{/* Hero Section */}
			<section className="relative py-20 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					<div className="text-center">
						<h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
							Энциклопедия
							<span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
								Животных
							</span>
						</h1>
						<p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
							Откройте удивительный мир животных с нашей comprehensive энциклопедией.
							Изучайте, сохраняйте и добавляйте своих любимых животных.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
							<Link
								to="/animals"
								className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
							>
								<svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
								Начать исследование
							</Link>
							<Link
								to="/addNewAnimal"
								className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center"
							>
								<svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
								</svg>
								Добавить животное
							</Link>
						</div>
					</div>
				</div>

				{/* Background decoration */}
				<div className="absolute top-10 left-10 text-6xl opacity-20">🦁</div>
				<div className="absolute top-20 right-20 text-5xl opacity-20">🐘</div>
				<div className="absolute bottom-10 left-20 text-4xl opacity-20">🦅</div>
				<div className="absolute bottom-20 right-10 text-6xl opacity-20">🐬</div>
			</section>

			{/* Stats Section */}
			<section className="py-16 bg-white/80 backdrop-blur-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="text-center">
							<div className="text-4xl font-bold text-blue-600 mb-2">{stats.totalAnimals}</div>
							<div className="text-gray-600 text-lg">Животных в базе</div>
						</div>
						<div className="text-center">
							<div className="text-4xl font-bold text-yellow-600 mb-2">{stats.favoriteAnimals}</div>
							<div className="text-gray-600 text-lg">В избранном</div>
						</div>
						<div className="text-center">
							<div className="text-4xl font-bold text-green-600 mb-2">{stats.featuredCategories.length}</div>
							<div className="text-gray-600 text-lg">Основных категорий</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-20 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							Возможности приложения
						</h2>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							Все что нужно для изучения мира животных в одном месте
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{features.map((feature, index) => (
							<div
								key={index}
								className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
							>
								<div className="text-4xl mb-4">{feature.icon}</div>
								<h3 className="text-xl font-semibold text-gray-900 mb-3">
									{feature.title}
								</h3>
								<p className="text-gray-600 leading-relaxed">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Categories Section */}
			<section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold mb-4">
							Популярные категории
						</h2>
						<p className="text-xl opacity-90 max-w-2xl mx-auto">
							Исследуйте животных по различным категориям и группам
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{stats.featuredCategories.map((category, index) => (
							<div
								key={index}
								className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
							>
								<div className="text-4xl mb-3">{category.icon}</div>
								<h3 className="text-xl font-semibold mb-2">{category.name}</h3>
								<p className="text-2xl font-bold opacity-90">{category.count}+ видов</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Recent Animals Section */}
			{recentAnimals.length > 0 && (
				<section className="py-20 px-4 sm:px-6 lg:px-8">
					<div className="max-w-7xl mx-auto">
						<div className="text-center mb-16">
							<h2 className="text-4xl font-bold text-gray-900 mb-4">
								Недавно добавленные животные
							</h2>
							<p className="text-xl text-gray-600 max-w-2xl mx-auto">
								Познакомьтесь с некоторыми животными из нашей коллекции
							</p>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{recentAnimals.map((animalName, index) => (
								<Link
									key={index}
									to={`/animals/${animalName}`}
									className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group"
								>
									<div className="flex items-center space-x-4">
										<div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center text-2xl text-white font-bold group-hover:scale-110 transition-transform duration-300">
											{animalName.charAt(0)}
										</div>
										<div className="flex-1">
											<h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
												{animalName}
											</h3>
											<p className="text-gray-500 text-sm mt-1">
												Изучить подробности →
											</p>
										</div>
									</div>
								</Link>
							))}
						</div>

						{allNames.length > 6 && (
							<div className="text-center mt-12">
								<Link
									to="/animals"
									className="inline-flex items-center px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 text-lg font-semibold"
								>
									<svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
									</svg>
									Смотреть всех животных ({allNames.length})
								</Link>
							</div>
						)}
					</div>
				</section>
			)}

			{/* CTA Section */}
			<section className="py-20 px-4 sm:px-6 lg:px-8">
				<div className="max-w-4xl mx-auto text-center">
					<h2 className="text-4xl font-bold text-gray-900 mb-6">
						Готовы начать исследование?
					</h2>
					<p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
						Присоединяйтесь к сообществу любителей животных и откройте для себя удивительный мир природы
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
						<Link
							to="/animals"
							className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
						>
							Исследовать животных
						</Link>
						<Link
							to="/addNewAnimal"
							className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105"
						>
							Добавить своё животное
						</Link>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-gray-900 text-white py-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<div className="text-2xl font-bold mb-4">Энциклопедия Животных</div>
						<p className="text-gray-400 mb-6 max-w-2xl mx-auto">
							Ваш надежный спутник в изучении удивительного мира животных.
							От маленьких насекомых до величественных млекопитающих.
						</p>
						<div className="flex justify-center space-x-6">
							<Link to="/animals" className="text-gray-400 hover:text-white transition-colors">
								Все животные
							</Link>
							<Link to="/favorites" className="text-gray-400 hover:text-white transition-colors">
								Избранное
							</Link>
							<Link to="/addNewAnimal" className="text-gray-400 hover:text-white transition-colors">
								Добавить животное
							</Link>
						</div>
						<div className="mt-6 text-gray-500 text-sm">
							© 2024 Энциклопедия Животных. Все права защищены.
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
};