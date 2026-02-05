import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { ReactNode } from 'react'

interface ModalState {
	isOpen: boolean
	content: ReactNode | null
}

const initialState: ModalState = {
	isOpen: false,
	content: null,
}

const modalSlice = createSlice({
	name: 'modal',
	initialState,
	reducers: {
		openModal: (state, action: PayloadAction<ReactNode>) => {
			state.isOpen = true
			state.content = action.payload
		},
		closeModal: (state) => {
			state.isOpen = false
			state.content = null
		},
	},
})

export const { openModal, closeModal } = modalSlice.actions
export default modalSlice.reducer
