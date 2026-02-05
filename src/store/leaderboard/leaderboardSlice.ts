import type { PeriodLeaderboard } from '@/store/api/leaderboard.api'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

interface LeaderboardState {
	selectedSeason: PeriodLeaderboard | null
	modalOpen: boolean
}

const initialState: LeaderboardState = {
	selectedSeason: null,
	modalOpen: false,
}

const leaderboardSlice = createSlice({
	name: 'leaderboard',
	initialState,
	reducers: {
		openModal: (state) => {
			state.modalOpen = true
		},
		closeModal: (state) => {
			state.modalOpen = false
		},
		selectSeason: (state, action: PayloadAction<PeriodLeaderboard | null>) => {
			state.selectedSeason = action.payload
		},
		resetSelectedSeason: (state) => {
			state.selectedSeason = null
		},
	},
})

export const { openModal, closeModal, selectSeason, resetSelectedSeason }
	= leaderboardSlice.actions

export default leaderboardSlice.reducer
