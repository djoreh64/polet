import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

interface RatesResponse {
	rates: {
		TON: {
			prices: {
				USD: number
			}
			diff_24h: {
				USD: string
			}
			diff_7d: {
				USD: string
			}
			diff_30d: {
				USD: string
			}
		}
	}
}

export const tonApi = createApi({
	reducerPath: 'tonApi',
	baseQuery: fetchBaseQuery({ baseUrl: 'https://tonapi.io/v2/' }),
	endpoints: builder => ({
		getTonToUsd: builder.query<RatesResponse, void>({
			query: () => 'rates?tokens=ton&currencies=usd',
		}),
	}),
})

export const { useGetTonToUsdQuery } = tonApi
