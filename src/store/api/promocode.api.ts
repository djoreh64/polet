import { api } from './api'

interface ActivatePromocodeRequest {
	code: string
}

export interface PromocodeSuccessResponse {
	success: boolean
	balance: string
	safe_balance: string
	pepes: number
	deposit_bonus_percent: number
	referral_attached: boolean
	received_bonus: boolean
	promocode: {
		code: string
		ton_amount: string
		pepes_amount: number
		deposit_bonus: number
		expires_at: string
	}
}

interface ActivateFromInventoryRequest {
	id: string
}

export const promocodesApi = api.injectEndpoints({
	endpoints: builder => ({
		activatePromocode: builder.mutation<PromocodeSuccessResponse, ActivatePromocodeRequest>({
			query: (body: { code: string }) => ({
				url: '/promocode/activate',
				method: 'POST',
				body,
			}),
			invalidatesTags: ['Info', 'Account'],
		}),
		activateFromInventory: builder.mutation<PromocodeSuccessResponse, ActivateFromInventoryRequest>({
			query: ({ id }: { id: string }) => ({
				url: `/inventory/${id}/activate`,
				method: 'POST',
			}),
			invalidatesTags: ['Info', 'Account', 'Gifts'],
		}),
	}),
})

export const { useActivatePromocodeMutation, useActivateFromInventoryMutation } = promocodesApi
