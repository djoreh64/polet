import { api } from '@/api/api.ts'

interface Response {
	input_amount: number
	input_currency: string
	output_amount: number
	output_currency: string
}

export const calculatorApi = api.injectEndpoints({
	endpoints: builder => ({
		dustToStars: builder.mutation<Response, { amount: number }>({
			query: params => ({
				method: 'GET',
				url: '/calculator/dust2stars',
				params,
			}),
		}),

		dustToTon: builder.mutation<Response, { amount: number }>({
			query: params => ({
				method: 'GET',
				url: '/calculator/dust2ton',
				params,
			}),
		}),
	}),
})

export const {
	useDustToStarsMutation,
	useDustToTonMutation,
} = calculatorApi
