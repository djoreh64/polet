import { api } from '@/api/api.ts'
import { showTelegramErrorPopup } from '@/utils/telegramError'

interface DonateStarsResponse {
	invoice_url: string
}
interface DonateGiftsResponse {
	is_generic: boolean
	gifts: {
		gift: string
		model: string
		price: string
		file_url: string
	}[]
}

export const donateApi = api.injectEndpoints({
	endpoints: builder => ({
		donateStars: builder.mutation<DonateStarsResponse, { amount: number }>({
			query: body => ({
				method: 'POST',
				url: '/deposit/telegram-stars',
				body,
			}),
			async onQueryStarted(_, { queryFulfilled }) {
				try {
					await queryFulfilled
				}
				catch (error: unknown) {
					showTelegramErrorPopup(error)
				}
			},
		}),
		donateCryptoPay: builder.mutation<DonateStarsResponse, { amount: number }>({
			query: body => ({
				method: 'POST',
				url: '/deposit/cryptopay',
				body,
			}),
		}),
		donateGift: builder.query<DonateGiftsResponse, void>({
			query: () => '/deposit/nft',
		}),
	}),

})

export const {
	useDonateStarsMutation,
	useDonateCryptoPayMutation,
	useDonateGiftQuery,
} = donateApi
