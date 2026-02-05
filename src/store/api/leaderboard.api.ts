import { api } from '@/api/api.ts'

export interface LeaderboardEntry {
	name: string
	win_sum: number
	opened_count: number
	place: number
	pfp_url: string
}

export interface LeaderboardResponse {
	season: number
	is_current: boolean
	period: string
	top: LeaderboardEntry[]
	current_user: LeaderboardEntry
}

export type AllTimeLeaderboard = {
	kind: 'all_time'
	id?: undefined
}

export interface Season {
	id: number
	name: string
	start_date: string
	end_date: string
	is_current: boolean
	is_finalized: boolean
}

export type PeriodLeaderboard = Season | AllTimeLeaderboard

export const leaderboardApi = api.injectEndpoints({
	endpoints: builder => ({
		getLeaderboard: builder.query<LeaderboardResponse, void>({
			query: () => '/leaderboard',
			providesTags: ['Leaderboard'],
		}),
		getSeasons: builder.query<{ seasons: Season[] }, void>({
			query: () => '/leaderboard/seasons',
			providesTags: ['Leaderboard'],
		}),
		getSeason: builder.query<LeaderboardResponse, number>({
			query: (seasonId: number | undefined) => seasonId ? `/leaderboard/seasons/${seasonId}` : '/leaderboard',
			providesTags: ['Leaderboard'],
		}),
	}),
})

export const {
	useGetLeaderboardQuery,
	useGetSeasonsQuery,
	useGetSeasonQuery,
} = leaderboardApi
