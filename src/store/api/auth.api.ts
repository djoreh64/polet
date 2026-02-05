import { api } from '@/api/api.ts'
import { actions } from '@/store/auth/auth.slice.ts'
import { store } from '@/store/store.ts'

export const authApi = api.injectEndpoints({
	endpoints: builder => ({
		auth: builder.mutation({
			query: (body: { init_data: string, start_param: string | undefined }) => {
				if (import.meta.env.VITE_DEV === 'true') {
					return {
						method: 'GET',
						url: 'debug/auth/707414024',
					}
				}
				return {
					method: 'POST',
					url: 'auth/telegram',
					body,
				}
			},
			transformResponse: (response: { access_token: string }) => {
				if (response.access_token) {
					store.dispatch(actions.setToken(response.access_token))
				}
				return response
			},
			async onQueryStarted(_, { queryFulfilled }) {
				try {
					await queryFulfilled
				}
				catch (error: unknown) {
					console.error(error)
				}
			},
		}),
	}),
})

export const { useAuthMutation } = authApi
