import type { FC } from 'react'

import useTranslation from '@/hooks/useTranslation.ts'

import Container from '@/ui/Container/Container.tsx'

import LeaderboardIcon from '@/assets/leaderboard.png'
import styles from './Head.module.scss'

const Head: FC = () => {
	const { t } = useTranslation()

	return (
		<section className={styles.head}>
			<Container className={styles.container}>
				<div className={styles.imgWrapper}>
					<img src={LeaderboardIcon} className={styles.img} alt="Leaderboard" />
				</div>
				<h1 className={styles.title}>{t('leaderboard.title')}</h1>
				<p className={styles.text}>{t('leaderboard.text')}</p>
			</Container>
		</section>
	)
}

export default Head
