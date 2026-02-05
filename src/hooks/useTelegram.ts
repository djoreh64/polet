import { useEffect } from 'react'

function UseTelegram() {
	const app = window?.Telegram?.WebApp

	useEffect(() => {
		app.ready()
	}, [app])

	return {
		user: app.initDataUnsafe?.user,
		webApp: app,
	}
}

export default UseTelegram
