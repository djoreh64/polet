import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { Case } from '@/store/api/content.api'

interface CrystalsState {
	currentCrystal: Case | null
}

const initialState: CrystalsState = {
	currentCrystal: null,
}

const crystalsSlice = createSlice({
	name: 'crystals',
	initialState,
	reducers: {
		setCurrentCrystal(state, action: PayloadAction<Case>) {
			state.currentCrystal = action.payload
		},
	},
})

export const { setCurrentCrystal } = crystalsSlice.actions
export default crystalsSlice.reducer
