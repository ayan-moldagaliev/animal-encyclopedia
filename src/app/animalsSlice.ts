import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Animal } from "../types/Animal";

interface AnimalsState {
	byName: Record<string, Animal>;
	allNames: string[];
	favorites: string[];
	loading: boolean;
	error: string | null;
	updatedAt: number | null;
}

const loadFromLocalStorage = (): AnimalsState | null => {
	try {
		const data = localStorage.getItem("animals-cache");
		if (!data) return null;
		return JSON.parse(data);
	} catch {
		return null;
	}
};

const saved = loadFromLocalStorage();

const initialState: AnimalsState = saved || {
	byName: {},
	allNames: [],
	favorites: [],
	loading: false,
	error: null,
	updatedAt: null,
};

const animalsSlice = createSlice({
	name: "animals",
	initialState,
	reducers: {
		setAnimals: (state, action: PayloadAction<Animal[]>) => {
			state.byName = {};
			state.allNames = [];
			action.payload.forEach((animal) => {
				if (!state.allNames.includes(animal.name)) {
					state.byName[animal.name] = animal;
					state.allNames.push(animal.name);
				}
			});
			state.updatedAt = Date.now();
			localStorage.setItem("animals-cache", JSON.stringify(state));
		},
		addFavorite: (state, action: PayloadAction<string>) => {
			if (!state.favorites.includes(action.payload)) state.favorites.push(action.payload);
			localStorage.setItem("animals-cache", JSON.stringify(state));
		},
		removeFavorite: (state, action: PayloadAction<string>) => {
			state.favorites = state.favorites.filter((name) => name !== action.payload);
			localStorage.setItem("animals-cache", JSON.stringify(state));
		},
		removeAnimal: (state, action: PayloadAction<string>) => {
			const animalName = action.payload;

			if (state.byName[animalName]) {
				delete state.byName[animalName];
			}

			state.allNames = state.allNames.filter(name => name !== animalName);

			state.favorites = state.favorites.filter(name => name !== animalName);

			state.updatedAt = Date.now();
			localStorage.setItem("animals-cache", JSON.stringify(state));
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.loading = action.payload;
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
		clearAnimals: (state) => {
			state.byName = {};
			state.allNames = [];
			state.favorites = [];
			state.updatedAt = null;
			localStorage.removeItem("animals-cache");
		},
	},
});

export const {
	setAnimals,
	addFavorite,
	removeFavorite,
	removeAnimal,
	setLoading,
	setError,
	clearAnimals
} = animalsSlice.actions;

export default animalsSlice.reducer;