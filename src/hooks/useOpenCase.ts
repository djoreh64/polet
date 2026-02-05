import type { AppDispatch, RootState } from '@/store/store'

import { actions as openCaseActions } from '@/store/openCase/openCase.slice'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { WonItem } from '@/store/api/game.api'

function useOpenCase() {
	const dispatch = useDispatch<AppDispatch>()
	const isOpening = useSelector((state: RootState) => state.openCase.isOpening)
	const caseItem = useSelector((state: RootState) => state.openCase.caseItem)

	const openCase = useCallback((caseItem: WonItem) => {
		dispatch(openCaseActions.open({ case: caseItem }))
	}, [dispatch])

	const setCase = useCallback((caseItem: WonItem) => {
		dispatch(openCaseActions.set({ case: caseItem }))
	}, [dispatch])

	const resetCase = useCallback(() => {
		dispatch(openCaseActions.reset())
	}, [dispatch])
	return { isOpening, caseItem, openCase, setCase, resetCase }
}

export default useOpenCase
