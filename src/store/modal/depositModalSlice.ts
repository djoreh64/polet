import { createSlice } from '@reduxjs/toolkit'

interface ModalState {
	isOpen: boolean
}

const initialState: ModalState = {
	isOpen: false,
}

const depositModalSlice = createSlice({
	name: 'depositModal',
	initialState,
	reducers: {
		openDepositModal: (state) => {
			state.isOpen = true
		},
		closeDepositModal: (state) => {
			state.isOpen = false
		},
	},
})

export const { openDepositModal, closeDepositModal } = depositModalSlice.actions
export default depositModalSlice.reducer
