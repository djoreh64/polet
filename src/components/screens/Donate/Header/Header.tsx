import type { FC } from 'react'

import useTranslation from '@/hooks/useTranslation.ts'

import Balance from '@/ui/Balance/Balance.tsx'
import Container from '@/ui/Container/Container.tsx'

import styles from './Header.module.scss'

const Header: FC = () => {
	const { t } = useTranslation()

	return (
		<header className={styles.header}>
			<Container className={styles.container}>
				<Balance amount={200} />
				<h1 className={styles.title}>
					<span className={styles.back}>{t('donate.title')}</span>
					{t('donate.title')}
					<span className={styles.front}>{t('donate.title')}</span>
				</h1>
			</Container>
		</header>
	)
}

export default Header
