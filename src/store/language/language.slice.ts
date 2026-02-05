import { createSlice } from '@reduxjs/toolkit'
import { detectLanguage } from '@/utils/language.ts'

interface InitialState {
	language: 'ru' | 'en'
}

const initialState: InitialState = {
	language: detectLanguage(),
}

export const languageSlice = createSlice({
	name: 'language',
	initialState,
	reducers: {
		setLanguage: (state, action) => {
			state.language = action.payload
			localStorage.setItem('language', action.payload)
		},
		toggleLanguage: (state) => {
			state.language = state.language === 'en' ? 'ru' : 'en'
			localStorage.setItem('language', state.language)
		},
	},
})

export const { actions, reducer } = languageSlice
