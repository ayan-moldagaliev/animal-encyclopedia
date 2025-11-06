import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from  './animalsApi';
import animalsReducer from './animalsSlice';

export const store = configureStore({
	reducer: {
		[baseApi.reducerPath]: baseApi.reducer,
		animals: animalsReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
