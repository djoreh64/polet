import type { FC } from 'react'

import { useAuthMutation } from '@/api/auth.api.ts'
import useTelegram from '@/hooks/useTelegram.ts'

import Navigation from '@/navigation/Navigation.tsx'

import Stars from '@/ui/Stars/Stars'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { MaintenancePage } from '@/ui/MaintenancePage'

const App: FC = () => {
	const { webApp } = useTelegram()
	const [auth, { isSuccess, isError }] = useAuthMutation()
	const language = useSelector((state: any) => state.language.language)

	useEffect(() => {
		auth({
			init_data: webApp.initData,
			start_param: webApp.initDataUnsafe.start_param,
		})
	}, [auth, webApp])

	useEffect(() => {
		document.documentElement.lang = language
	}, [language])

	return (
		<>
			<Stars />
			{isSuccess && <Navigation />}
			{isError && <MaintenancePage />}
		</>
	)
}

export default App
