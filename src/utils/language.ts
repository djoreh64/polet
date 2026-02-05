export const AVAILABLE_LANGUAGES = ['en', 'ru'] as const
export type Language = typeof AVAILABLE_LANGUAGES[number]

export function detectLanguage(): Language {
	if (typeof localStorage !== 'undefined') {
		const stored = localStorage.getItem('language')
		if (stored && AVAILABLE_LANGUAGES.includes(stored as Language))
			return stored as Language
	}

	const tgLang = window?.Telegram?.WebApp?.initDataUnsafe?.user?.language_code?.slice(0, 2)
	if (tgLang && AVAILABLE_LANGUAGES.includes(tgLang as Language))
		return tgLang as Language

	const systemLang = navigator?.language?.slice(0, 2)
	if (systemLang && AVAILABLE_LANGUAGES.includes(systemLang as Language))
		return systemLang as Language

	return 'en'
}
