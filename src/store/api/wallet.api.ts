import { showTelegramErrorPopup } from '@/utils/telegramError'
import { api } from './api'

type WithdrawReferralResponse = { success: boolean }

export const walletApi = api.injectEndpoints({
	endpoints: builder => ({
		withdrawnReferral: builder.mutation<WithdrawReferralResponse, void>({
			query: () => ({
				method: 'POST',
				url: '/me/referral/withdraw',
			}),
			invalidatesTags: ['Info', 'Account'],
			async onQueryStarted(_, { dispatch, queryFulfilled }) {
				try {
					await queryFulfilled

					// Мгновенно обнуляем реферальный баланс в UI
					dispatch(
						api.util.updateQueryData('getReferralInfo', undefined, (draft: any) => {
							if (!draft) {
								return
							}
							draft.balance = 0
						}),
					)
				}
				catch (error: unknown) {
					showTelegramErrorPopup(error)
				}
			},
		}),

	}),
})

export const { useWithdrawnReferralMutation } = walletApi
