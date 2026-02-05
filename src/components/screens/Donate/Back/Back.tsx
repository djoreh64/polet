import type { FC } from 'react'

import useTranslation from '@/hooks/useTranslation.ts'

import Button from '@/ui/Button/Button.tsx'
import Container from '@/ui/Container/Container.tsx'

import { useNavigate } from 'react-router'

import styles from './Back.module.scss'

const Back: FC = () => {
	const navigate = useNavigate()

	const { t } = useTranslation()

	const handleBackButton = () => {
		navigate(-1)
	}

	return (
		<section className={styles.back}>
			<Container>
				<Button className={styles.button} onClick={handleBackButton}>{t('donate.back')}</Button>
			</Container>
		</section>
	)
}

export default Back
