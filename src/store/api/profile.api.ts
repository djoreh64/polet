import { api } from '@/api/api.ts'
import { showTelegramErrorPopup } from '@/utils/telegramError'
import { PrizeTypeEnum } from './content.api'

interface InfoResponse {
	success: boolean
	id: number
	first_name: string
	last_name: string
	username: string
	pfp_url: string
	language_code: string
	is_subscribed_channel: boolean
	is_completed_tutorial: boolean
	is_demo: boolean
}

interface AccountResponse {
	success: boolean
	balance: number
	safe_balance: number
	demo_balance: number
	pepes: number
	next_pepe_claim_at: number
	deposit_bonus_percent: number
	payment_id: string
}

export interface SpinItem {
	type: string
	date: string
	price: number
	name: string
	rarity: string
	file_url: string
	prize_type: PrizeTypeEnum
}

interface SpinsResponse {
	success: boolean
	items?: SpinItem[]
	total: number
	page: number
	size: number
}

interface Gift {
	id: string
	type: string
	amount: string
	rarity: string
	file_url: string
	withdrawable_after: string
	can_sell_for_safe: boolean
	sell_price: string
	can_withdraw: boolean
	can_sell: boolean
	can_activate: boolean
	telegram_gift_template: {
		gift: string
		model: string
		background: string
	}
	direct_telegram_gift: {
		gift: string
		model: string
		background: string
		symbol: string
		number: number
		slug: string
	}
	promocode: {
		pepes: number
		ton_amount: string
		deposit_bonus: number
		expires_at: string
		is_expired: boolean
	}
}
interface GiftsResponse {
	success: boolean
	page: number
	max_pages: number
	items_count: number
	items: Gift[]
}

export interface Task {
	id: string
	name: string
	bonus: number
	task_type: string
	is_completed: boolean
	partnership_data?: {
		action_type: string
		channel_id: string
		link: string
	}
	referral_data?: {
		min_count: number
	}
}

export interface TasksResponse {
	tasks: Task[]
}

export interface ReferralInfoResponse {
	cases_opened: number
	referral_count: number
	referral_total_deposit: number
	all_time_profit: number
	balance: number
	locked_balance: number
	referral_income_percent: number
	referral_level: {
		id: number
		name: string
		min_referrals: number
		min_total_deposit: number
		percent: number
		is_exclusive: boolean
	}
	referral_link: string
}

interface DemoModeResponse {
	success: boolean
	is_demo: boolean
}

interface ReferralTopResponse {
	items: {
		user_id: number
		first_name: string
		pfp_url: string
		profit: number
		cases_opened: number
	}[]
	total: number
	page: number
	page_size: number
}

export const profileApi = api.injectEndpoints({
	endpoints: builder => ({
		getInfo: builder.query<InfoResponse, void>({
			query: () => '/me/profile',
			providesTags: ['Info'],
		}),

		setLanguage: builder.mutation<void, string>({
			query: language => ({
				method: 'POST',
				url: '/me/language',
				params: {
					language_code: language,
				},
			}),
		}),

		getAccount: builder.query<AccountResponse, void>({
			query: () => '/me/account',
			providesTags: ['Account'],
		}),

		getSpins: builder.query<SpinsResponse, { page?: number, demo?: boolean, size?: number }>({
			query: ({ page = 1, demo = false, size = 10 }) => ({
				url: '/me/activity',
				params: {
					page,
					demo,
					size,
				},
			}),
			// infinite scroll: аккумулируем страницы в одном кэше
			serializeQueryArgs: ({ endpointName, queryArgs }) =>
				`${endpointName}-${queryArgs.demo ? 'demo' : 'prod'}-${queryArgs.size ?? 10}`,
			merge: (currentCache, newItems) => {
				// первая страница или пустой кэш — просто заменяем
				if (!currentCache.items?.length || newItems.page === 1) {
					Object.assign(currentCache, newItems)
					return
				}

				if (newItems.items?.length) {
					if (!currentCache.items) {
						currentCache.items = []
					}

					currentCache.items.push(...newItems.items)
					currentCache.page = newItems.page
					currentCache.size = newItems.size
					currentCache.total = newItems.total
				}
			},
			forceRefetch: ({ currentArg, previousArg }) =>
				currentArg?.page !== previousArg?.page
				|| currentArg?.demo !== previousArg?.demo
				|| currentArg?.size !== previousArg?.size,
			providesTags: ['Spins'],
		}),

		getGifts: builder.query<GiftsResponse, { page?: number, demo?: boolean }>({
			query: ({ page = 1, demo = false }) => ({
				url: '/inventory',
				params: {
					page,
					demo,
				},
			}),
			providesTags: ['Gifts'],
		}),

		sellAllGifts: builder.mutation({
			query: () => ({
				method: 'POST',
				url: '/inventory/sell-all',
			}),
			invalidatesTags: ['Gifts', 'Info', 'Account'],
		}),

		sellGift: builder.mutation({
			query: (params: { user_gift_id: string }) => ({
				method: 'POST',
				url: `/inventory/${params.user_gift_id}/sell`,
			}),
			invalidatesTags: ['Gifts', 'Info', 'Account'],
			async onQueryStarted(_, { queryFulfilled }) {
				try {
					await queryFulfilled
				}
				catch (error: unknown) {
					showTelegramErrorPopup(error)
				}
			},
		}),

		withdrawGift: builder.mutation({
			query: (params: { user_gift_id: string, destination?: 'portals' | 'telegram' }) => ({
				method: 'POST',
				url: `/inventory/${params.user_gift_id}/withdraw`,
				body: {
					destination: params.destination || 'portals',
				},
			}),
			invalidatesTags: ['Gifts'],
		}),

		getTasks: builder.query<TasksResponse, void>({
			query: () => '/tasks',
			providesTags: ['Tasks'],
		}),

		completeTask: builder.mutation({
			query: (params: { task_id: string }) => ({
				method: 'POST',
				url: `/tasks/${params.task_id}/complete`,
			}),
			invalidatesTags: ['Tasks', 'Info', 'Account'],
			async onQueryStarted(_, { queryFulfilled }) {
				try {
					await queryFulfilled
				}
				catch (error: unknown) {
					showTelegramErrorPopup(error)
				}
			},
		}),
		getReferralInfo: builder.query<ReferralInfoResponse, void>({
			query: () => '/me/referral',
		}),
		getReferralTop: builder.query<ReferralTopResponse, void>({
			query: () => '/me/referral/top',
		}),
		toggleDemoMode: builder.mutation<DemoModeResponse, boolean>({
			query: demoStatus => ({
				url: '/me/demo',
				method: 'POST',
				body: {
					enabled: demoStatus,
					demo_balance: 1000,
				},
			}),
			invalidatesTags: ['Info', 'Account'],
		}),
		completeTutorial: builder.mutation<void, void>({
			query: () => ({
				method: 'POST',
				url: '/me/complete-tutorial',
			}),
			invalidatesTags: ['Info'],
		}),
	}),
})

export const {
	useGetInfoQuery,
	useGetAccountQuery,
	useSetLanguageMutation,
	useGetSpinsQuery,
	useGetGiftsQuery,
	useSellGiftMutation,
	useSellAllGiftsMutation,
	useWithdrawGiftMutation,
	useGetTasksQuery,
	useCompleteTaskMutation,
	useGetReferralInfoQuery,
	useToggleDemoModeMutation,
	useCompleteTutorialMutation,
	useGetReferralTopQuery,
} = profileApi
