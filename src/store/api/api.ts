import { store } from '@/store/store'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_URL } from '../../env'

const baseQuery = fetchBaseQuery({
	baseUrl: API_URL,
	prepareHeaders: (headers) => {
		const token = store.getState().auth.token
		if (token) {
			headers.set('Authorization', `Bearer ${token}`)
		}
		return headers
	},
})

export const api = createApi({
	reducerPath: 'api',
	tagTypes: ['Spins', 'Gifts', 'Account', 'Tasks', 'Info', 'Wins', 'PlaneGameWins', 'DonateGifts', 'ActiveGifts', 'Promocodes', 'Leaderboard'],
	baseQuery,
	endpoints: () => ({}),
})
