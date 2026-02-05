import type { RootState } from '@/store/store'
import { actions } from '@/store/language/language.slice.ts'

import en from '@/translations/en.json'
import ru from '@/translations/ru.json'

import { useDispatch, useSelector } from 'react-redux'
import { useSetLanguageMutation } from '@/store/api/profile.api'

const translations: {
	[key: string]: any
} = { en, ru }

function useTranslation() {
	const dispatch = useDispatch()
	const [notifySetLanguage] = useSetLanguageMutation()
	const language = useSelector((state: RootState) => state.language.language)
	const languages = ['ru', 'en']

	const translate = (key: string) => {
		const keys = key.split('.')
		return keys.reduce((obj, key) => {
			return obj?.[key]
		}, translations[language])
	}

	const setLanguage = (language: 'ru' | 'en') => {
		dispatch(actions.setLanguage(language))
		notifySetLanguage(language)
	}

	const toggleLanguage = () => {
		dispatch(actions.toggleLanguage())
		notifySetLanguage(language)
	}

	return { t: translate, language, languages, setLanguage, toggleLanguage }
}

export default useTranslation
