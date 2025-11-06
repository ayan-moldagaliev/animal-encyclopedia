import { type FC, useState, useCallback, ChangeEvent, FormEvent } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setAnimals } from "../app/animalsSlice";
import type { Animal } from "../types/Animal";

interface AnimalFormData {
	name: string;
	taxonomy: Record<string, string>;
	locations: string[];
	characteristics: Record<string, string | number | string[]>;
	image?: File;
	imageUrl?: string;
}

const initialFormData: AnimalFormData = {
	name: "",
	taxonomy: {
		kingdom: "",
		phylum: "",
		class: "",
		order: "",
		family: "",
		genus: "",
		scientific_name: "",
	},
	locations: [""],
	characteristics: {
		diet: "",
		habitat: "",
		lifespan: "",
		weight: "",
		length: "",
		height: "",
		color: "",
		top_speed: "",
		main_prey: "",
		predators: "",
		slogan: "",
	},
};

export const CreateAnimalForm: FC = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [formData, setFormData] = useState<AnimalFormData>(initialFormData);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleInputChange = useCallback((
		section: 'name' | 'taxonomy' | 'characteristics' | 'locations' | 'imageUrl',
		field: string,
		value: string | string[] | File | Record<string, string> | Record<string, string | number | string[]>
	) => {
		setFormData(prev => {
			if (section === 'taxonomy') {
				return {
					...prev,
					taxonomy: {
						...prev.taxonomy,
						[field]: value as string
					}
				};
			} else if (section === 'characteristics') {
				return {
					...prev,
					characteristics: {
						...prev.characteristics,
						[field]: value as string | number | string[]
					}
				};
			} else if (section === 'locations') {
				return {
					...prev,
					locations: value as string[]
				};
			} else {
				return {
					...prev,
					[field]: value
				};
			}
		});
	}, []);

	const handleLocationChange = useCallback((index: number, value: string) => {
		const newLocations = [...formData.locations];
		newLocations[index] = value;
		handleInputChange('locations', 'locations', newLocations);
	}, [formData.locations, handleInputChange]);

	const addLocation = useCallback(() => {
		handleInputChange('locations', 'locations', [...formData.locations, ""]);
	}, [formData.locations, handleInputChange]);

	const removeLocation = useCallback((index: number) => {
		const newLocations = formData.locations.filter((_, i) => i !== index);
		handleInputChange('locations', 'locations', newLocations);
	}, [formData.locations, handleInputChange]);

	const handleImageUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			// Validate file type
			if (!file.type.startsWith('image/')) {
				alert('Пожалуйста, выберите файл изображения');
				return;
			}

			// Validate file size (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				alert('Размер файла не должен превышать 5MB');
				return;
			}

			setFormData(prev => ({ ...prev, image: file }));

			// Create preview
			const reader = new FileReader();
			reader.onload = (e) => {
				setImagePreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	}, []);

	const removeImage = useCallback(() => {
		setFormData(prev => ({ ...prev, image: undefined }));
		setImagePreview(null);
	}, []);

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		setIsSubmitting(true);

		try {
			// Validate required fields
			if (!formData.name.trim()) {
				alert('Пожалуйста, введите название животного');
				return;
			}

			// Filter out empty taxonomy fields
			const filteredTaxonomy: Record<string, string> = {};
			Object.entries(formData.taxonomy).forEach(([key, value]) => {
				if (value && value.toString().trim()) {
					filteredTaxonomy[key] = value.toString().trim();
				}
			});

			// Filter out empty characteristics fields
			const filteredCharacteristics: Record<string, string | number | string[]> = {};
			Object.entries(formData.characteristics).forEach(([key, value]) => {
				if (value && (
					(typeof value === 'string' && value.trim()) ||
					(typeof value === 'number' && !isNaN(value)) ||
					(Array.isArray(value) && value.some(v => v.trim()))
				)) {
					filteredCharacteristics[key] = value;
				}
			});

			// Filter out empty locations
			const filteredLocations = formData.locations.filter(location => location.trim());

			// Create animal object with proper structure
			const newAnimal: Animal = {
				name: formData.name.trim(),
				taxonomy: filteredTaxonomy,
				locations: filteredLocations,
				characteristics: filteredCharacteristics,
			};

			// Handle image
			let finalImageUrl = formData.imageUrl;
			if (formData.image) {
				// In a real application, you would upload the image to your server here
				// For now, we'll use the local preview URL or a placeholder
				finalImageUrl = imagePreview || '/placeholder-animal.jpg';

				// Simulate upload delay
				await new Promise(resolve => setTimeout(resolve, 1000));
			}

			// Add image URL if available
			if (finalImageUrl) {
				newAnimal.image = finalImageUrl;
			}

			// Get existing animals from localStorage or create empty array
			const existingData = localStorage.getItem('animals-cache');
			let existingAnimals: Animal[] = [];

			if (existingData) {
				try {
					const parsed = JSON.parse(existingData);
					existingAnimals = parsed.allNames?.map((name: string) => parsed.byName[name]) || [];
				} catch (error) {
					console.warn('Error parsing existing animals data:', error);
				}
			}

			// Check for duplicate names
			if (existingAnimals.some(animal => animal.name.toLowerCase() === newAnimal.name.toLowerCase())) {
				alert('Животное с таким названием уже существует!');
				return;
			}

			// Add new animal to existing list
			const updatedAnimals = [...existingAnimals, newAnimal];

			// Update Redux store
			dispatch(setAnimals(updatedAnimals));

			// Show success message
			alert('Животное успешно добавлено!');

			// Redirect to the new animal's page
			navigate(`/animals/${encodeURIComponent(newAnimal.name)}`);

		} catch (error) {
			console.error('Error creating animal:', error);
			alert('Произошла ошибка при создании животного');
		} finally {
			setIsSubmitting(false);
		}
	};

	const taxonomyFields = [
		{ key: 'kingdom', label: 'Царство', placeholder: 'Животные' },
		{ key: 'phylum', label: 'Тип', placeholder: 'Хордовые' },
		{ key: 'class', label: 'Класс', placeholder: 'Млекопитающие' },
		{ key: 'order', label: 'Отряд', placeholder: 'Хищные' },
		{ key: 'family', label: 'Семейство', placeholder: 'Кошачьи' },
		{ key: 'genus', label: 'Род', placeholder: 'Пантеры' },
		{ key: 'scientific_name', label: 'Научное название', placeholder: 'Panthera leo' },
	];

	const characteristicFields = [
		{ key: 'diet', label: 'Питание', placeholder: 'Плотоядное' },
		{ key: 'habitat', label: 'Среда обитания', placeholder: 'Саванна, grassland' },
		{ key: 'lifespan', label: 'Продолжительность жизни', placeholder: '15', unit: 'лет' },
		{ key: 'weight', label: 'Вес', placeholder: '180', unit: 'кг' },
		{ key: 'length', label: 'Длина', placeholder: '250', unit: 'см' },
		{ key: 'height', label: 'Высота', placeholder: '120', unit: 'см' },
		{ key: 'color', label: 'Цвет', placeholder: 'Золотисто-желтый' },
		{ key: 'top_speed', label: 'Максимальная скорость', placeholder: '80', unit: 'км/ч' },
		{ key: 'main_prey', label: 'Основная добыча', placeholder: 'Антилопы, зебры' },
		{ key: 'predators', label: 'Хищники', placeholder: 'Человек' },
		{ key: 'slogan', label: 'Описание', placeholder: 'Король джунглей' },
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<Link
						to="/animals"
						className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
					>
						<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
						</svg>
						Назад к списку животных
					</Link>
					<h1 className="text-3xl font-bold text-gray-900">Добавить новое животное</h1>
					<p className="text-gray-600 mt-2">Заполните информацию о животном</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-8">
					{/* Basic Information Card */}
					<div className="bg-white rounded-2xl shadow-lg p-6">
						<h2 className="text-xl font-semibold text-gray-800 mb-4">Основная информация</h2>

						<div className="grid grid-cols-1 gap-4">
							<div>
								<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
									Название животного *
								</label>
								<input
									type="text"
									id="name"
									value={formData.name}
									onChange={(e) => handleInputChange('name', 'name', e.target.value)}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
									placeholder="Например: Лев"
									required
								/>
							</div>

							{/* Image Upload */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Изображение животного
								</label>

								{imagePreview ? (
									<div className="flex items-center space-x-4">
										<div className="relative">
											<img
												src={imagePreview}
												alt="Preview"
												className="w-32 h-32 object-cover rounded-lg border border-gray-300"
											/>
											<button
												type="button"
												onClick={removeImage}
												className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
											>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
												</svg>
											</button>
										</div>
										<span className="text-sm text-gray-500">Изображение загружено</span>
									</div>
								) : (
									<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
										<svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
										</svg>
										<label htmlFor="image-upload" className="cursor-pointer">
											<span className="text-blue-600 hover:text-blue-800 font-medium">Загрузите изображение</span>
											<span className="text-gray-500 ml-2">или перетащите его сюда</span>
										</label>
										<p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP до 5MB</p>
										<input
											id="image-upload"
											type="file"
											accept="image/*"
											onChange={handleImageUpload}
											className="hidden"
										/>
									</div>
								)}
							</div>

							{/* External Image URL */}
							<div>
								<label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
									Или укажите ссылку на изображение
								</label>
								<input
									type="url"
									id="imageUrl"
									value={formData.imageUrl || ''}
									onChange={(e) => handleInputChange('imageUrl', 'imageUrl', e.target.value)}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
									placeholder="https://example.com/image.jpg"
								/>
							</div>
						</div>
					</div>

					{/* Taxonomy Card */}
					<div className="bg-white rounded-2xl shadow-lg p-6">
						<h2 className="text-xl font-semibold text-gray-800 mb-4">Классификация</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{taxonomyFields.map((field) => (
								<div key={field.key}>
									<label htmlFor={field.key} className="block text-sm font-medium text-gray-700 mb-2">
										{field.label}
									</label>
									<input
										type="text"
										id={field.key}
										value={formData.taxonomy[field.key] || ''}
										onChange={(e) => handleInputChange('taxonomy', field.key, e.target.value)}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
										placeholder={field.placeholder}
									/>
								</div>
							))}
						</div>
					</div>

					{/* Characteristics Card */}
					<div className="bg-white rounded-2xl shadow-lg p-6">
						<h2 className="text-xl font-semibold text-gray-800 mb-4">Особенности</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{characteristicFields.map((field) => (
								<div key={field.key}>
									<label htmlFor={`char-${field.key}`} className="block text-sm font-medium text-gray-700 mb-2">
										{field.label}
										{field.unit && <span className="text-gray-400 ml-1">({field.unit})</span>}
									</label>
									<input
										type="text"
										id={`char-${field.key}`}
										value={formData.characteristics[field.key]?.toString() || ''}
										onChange={(e) => handleInputChange('characteristics', field.key, e.target.value)}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
										placeholder={field.placeholder}
									/>
								</div>
							))}
						</div>
					</div>

					{/* Locations Card */}
					<div className="bg-white rounded-2xl shadow-lg p-6">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-semibold text-gray-800">Места обитания</h2>
							<button
								type="button"
								onClick={addLocation}
								className="flex items-center px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
							>
								<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
								</svg>
								Добавить
							</button>
						</div>

						<div className="space-y-3">
							{formData.locations.map((location, index) => (
								<div key={index} className="flex items-center space-x-3">
									<input
										type="text"
										value={location}
										onChange={(e) => handleLocationChange(index, e.target.value)}
										className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
										placeholder="Например: Африка, Азия"
									/>
									{formData.locations.length > 1 && (
										<button
											type="button"
											onClick={() => removeLocation(index)}
											className="p-2 text-red-500 hover:text-red-700 transition-colors"
										>
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									)}
								</div>
							))}
						</div>
					</div>

					{/* Submit Button */}
					<div className="flex justify-end space-x-4">
						<Link
							to="/animals"
							className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
						>
							Отмена
						</Link>
						<button
							type="submit"
							disabled={isSubmitting}
							className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
						>
							{isSubmitting ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
									Добавление...
								</>
							) : (
								<>
									<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
									</svg>
									Добавить животное
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};