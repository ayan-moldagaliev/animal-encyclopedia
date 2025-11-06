import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Animal } from '../types/Animal';

export const baseApi = createApi({
	reducerPath: 'api',
	baseQuery: fetchBaseQuery({
		baseUrl: 'https://api.api-ninjas.com/v1/',
		prepareHeaders: (headers: Headers) => {
			headers.set('x-api-key', 'uKYfglNP7hmoHsbNvxFWQA==Xvue9mCgkuRzSoou');
			return headers;
		},
	}),
	endpoints: (builder) => ({
		getAnimalsByLetter: builder.query<Animal[], string>({
			query: (letter) => `animals?name=${letter}`,
			transformResponse: (response: any): Animal[] =>
				Array.isArray(response) ? response : [response],
		}),
	}),
});

export const { useLazyGetAnimalsByLetterQuery } = baseApi;
