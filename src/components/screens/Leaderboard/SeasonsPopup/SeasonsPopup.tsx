import IconCrown from '@/assets/icons/iconCrown.svg?react'
import useTranslation from '@/hooks/useTranslation'
import { useGetSeasonsQuery } from '@/store/api/leaderboard.api'
import { closeModal, selectSeason } from '@/store/leaderboard/leaderboardSlice'
import type { RootState } from '@/store/store'
import Button from '@/ui/Button/Button'
import { motion } from 'motion/react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import styles from './SeasonsPopup.module.scss'

const backdropVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: 20 },
}

function SeasonsPopup() {
	const dispatch = useDispatch()
	const { data: leaderboardData } = useGetSeasonsQuery()
	const selectedSeason = useSelector((state: RootState) => state.leaderboard.selectedSeason)
	const modalOpen = useSelector((state: RootState) => state.leaderboard.modalOpen)

	const { t } = useTranslation()

	if (!modalOpen || !leaderboardData)
		return null

	return createPortal (

		<motion.div
			className={styles.popup}
			variants={backdropVariants}
			initial="hidden"
			animate="visible"
			exit="exit"
			transition={{ duration: 0.2, ease: 'easeInOut' }}
		>
			<div>
				<IconCrown className={styles.icon} />
				<h2 className={styles.title}>{t('leaderboard.popup.title')}</h2>
				<p className={styles.subtitle}>{t('leaderboard.popup.description')}</p>

				<div className={styles.grid}>
					{leaderboardData.seasons && leaderboardData.seasons?.map(season => (
						<button
							type="button"
							key={season.id}
							className={`${styles.card} ${season.id === selectedSeason?.id ? styles.active : ''}`}
							onClick={() => {
								dispatch(selectSeason(season))
								dispatch(closeModal())
							}}
						>
							<span className={styles.season}>
								Season
								{' '}
								{season.id}
							</span>
							<span className={styles.date}>
								{season.name}
							</span>
						</button>
					))}
				</div>
			</div>
			<Button className={styles.button} onClick={() => dispatch(closeModal())}>{t('donate.back')}</Button>

		</motion.div>,
		document.body,
	)
}

export default SeasonsPopup
