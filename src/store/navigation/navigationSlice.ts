import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

interface NavigationState {
	origin: string | null
}

const initialState: NavigationState = {
	origin: null,
}

const navigationSlice = createSlice({
	name: 'navigation',
	initialState,
	reducers: {
		setOrigin: (state, action: PayloadAction<string>) => {
			state.origin = action.payload
		},
		clearOrigin: (state) => {
			state.origin = null
		},
	},
})

export const { setOrigin, clearOrigin } = navigationSlice.actions
export default navigationSlice.reducer
