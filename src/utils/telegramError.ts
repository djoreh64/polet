import { detectLanguage } from '@/utils/language.ts'

export function showTelegramErrorPopup(error: any) {
	const language = detectLanguage()

	if (typeof error === 'string') {
		Telegram.WebApp?.showPopup({
			title: 'alert',
			message: error,
			buttons: [{ id: 'ok', type: 'default', text: language === 'en' ? 'Ok' : 'Ок' }],
		})
	}

	const message = error?.error?.data?.detail || language === 'en' ? 'Something went wrong' : 'Произошла неизвестная ошибка'

	Telegram.WebApp?.showPopup({
		title: language === 'en' ? 'Error' : 'Ошибка',
		message,
		buttons: [{ id: 'ok', type: 'default', text: language === 'en' ? 'Ok' : 'Ок' }],
	})
}
