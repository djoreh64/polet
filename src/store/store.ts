import { api } from '@/api/api.ts'
import { tonApi } from '@/api/tonApi'

import { reducer as authReducer } from '@/store/auth/auth.slice'
import { reducer as languageReducer } from '@/store/language/language.slice'
import leaderboardReducer from '@/store/leaderboard/leaderboardSlice'
import depositModalReducer from '@/store/modal/depositModalSlice'
import modalReducer from '@/store/modal/modalSlice'
import navigationReducer from '@/store/navigation/navigationSlice'
import crystalsReducer from '@/store/openCase/crystalSlice'
import { reducer as openCaseReducer } from '@/store/openCase/openCase.slice'
import uiReducer from '@/store/ui/uiSlice'

import { combineReducers, configureStore } from '@reduxjs/toolkit'

const reducers = combineReducers({
	auth: authReducer,
	language: languageReducer,
	openCase: openCaseReducer,
	crystals: crystalsReducer,
	depositModal: depositModalReducer,
	modal: modalReducer,
	ui: uiReducer,
	leaderboard: leaderboardReducer,
	navigation: navigationReducer,
	[api.reducerPath]: api.reducer,
	[tonApi.reducerPath]: tonApi.reducer,
})

export const store = configureStore({
	reducer: reducers,
	devTools: true,
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware().concat(api.middleware, tonApi.middleware),
})

export type AppStore = typeof store
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
