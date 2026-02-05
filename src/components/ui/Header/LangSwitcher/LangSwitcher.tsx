import type { FC } from 'react'

import useTranslation from '@/hooks/useTranslation.ts'

import Button from '@/ui/Button/Button.tsx'
import Icon from '@/ui/Icon/Icon.tsx'

import styles from './LangSwitcher.module.scss'

const LangSwitcher: FC = () => {
	const { language, toggleLanguage } = useTranslation()

	return (
		<Button className={styles.button} onClick={toggleLanguage}>
			<Icon name="language" width={20} height={20} />
			<span>{language === 'en' ? 'Eng' : 'Rus'}</span>
		</Button>
	)
}

export default LangSwitcher
