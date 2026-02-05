import type { PrizeModel } from '@/store/api/content.api'
import type { WonItem } from '@/store/api/game.api'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

interface InitialState {
	isOpening: boolean
	caseItem: WonItem | null
}

const initialState: InitialState = {
	isOpening: false,
	caseItem: null,
}

export const openCaseSlice = createSlice({
	name: 'openCase',
	initialState,
	reducers: {
		open: (state, action: PayloadAction<{ case: WonItem }>) => {
			state.isOpening = true
			state.caseItem = action.payload.case
		},
		set: (state, action: PayloadAction<{ case: WonItem }>) => {
			state.caseItem = action.payload.case
			state.isOpening = false
		},
		reset: (state) => {
			state.isOpening = false
			state.caseItem = null
		},
	},
})

export const { actions, reducer } = openCaseSlice
