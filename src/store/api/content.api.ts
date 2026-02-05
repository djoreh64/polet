import { api } from '@/api/api.ts'
import type { Rarity } from '@/ui/BackgroundPattern/BackgroundPattern.tsx'
import type { Dust } from './game.api'

export enum PrizeTypeEnum {
	GIFT = 'telegram_gift_template',
	DUST = 'ton',
	PROMOCODE = 'promocode',
}

export interface Promocode {
	pepes: number
	ton_amount: string
	deposit_bonus: number
}

export interface PrizeModel {
	prize_id: string
	prize_type: PrizeTypeEnum
	rarity: Rarity
	status: string
	user_prize_id: number

	// gift
	id: number | null
	type: string | null
	model: string | null
	symbol: string | null
	background: string | null
	slug: string | null
	floor_price: number | null

	// dust / promocode
	name: string | null
	amount: number | null

	// только для промокодов
	promocode: Promocode | null
	original_promocode_id: number | null
}

interface Gift {
	gift: string
	model: string
	background: string
}

export interface Reward {
	id: string
	rarity: string
	file_url: string
	amount: string
	type: string
	gift: Gift
	promocode: Promocode
}

export interface Case {
	id: string
	type: string
	file_url: string
	price: string
	rewards: Reward[]
}

type CasesResponse = Case[]

interface LatestWinUser {
	first_name: string
	pfp_url: string | null
}

interface LatestWin {
	user: LatestWinUser
	reward: Reward
}

type LatestWinsResponse = LatestWin[]

interface AviamastersWinUser {
	first_name: string
	pfp_url: string | null
}

export interface AviamastersWinItem {
	user: AviamastersWinUser
	bet_amount: number
	multiplier: number
	payout_amount: number
	created_at: string
}

type AviamastersLatestWinsResponse = AviamastersWinItem[]

interface ReferralLevelsResponse {
	total_levels: number
	levels: Array<{
		id: number
		name: string
		min_referrals: number
		min_total_deposit: number
		percent: number
		is_exclusive: boolean
	}>
}

export interface ConfigResponse {
	ton_bonus_percentage: number | null
	cryptopay_bonus_percentage: number | null
	telegram_stars_bonus_percentage: number | null
	withdrawal_fee_direct_telegram: number
	withdrawal_fee_direct_portals: number
	withdrawal_fee_template_telegram: number
	withdrawal_fee_template_portals: number
	sell_fee_template: number
	sell_fee_direct: number
	withdrawals_enabled: boolean
}

export const contentApi = api.injectEndpoints({
	endpoints: builder => ({
		getCases: builder.query<CasesResponse, void>({
			query: () => '/roulette/cases',
		}),

		getLatestWins: builder.query<LatestWinsResponse, void>({
			query: () => '/roulette/latest-wins',
			providesTags: ['Wins'],
		}),

		getPlaneGameLatestWins: builder.query<AviamastersLatestWinsResponse, void>({
			query: () => '/mini-games/aviamasters/latest-wins',
			providesTags: ['PlaneGameWins'],
		}),

		getReferralLevels: builder.query<ReferralLevelsResponse, void>({
			query: () => '/config/referral',
		}),

		getConfig: builder.query<ConfigResponse, void>({
			query: () => '/config',
		}),
	}),
})

export const {
	useGetCasesQuery,
	useGetLatestWinsQuery,
	useGetPlaneGameLatestWinsQuery,
	useGetReferralLevelsQuery,
	useGetConfigQuery,
} = contentApi
