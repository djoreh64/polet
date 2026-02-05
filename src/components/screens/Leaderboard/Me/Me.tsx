import type { FC } from 'react'

import Item from '@/screens/Leaderboard/Item/Item.tsx'

import Container from '@/ui/Container/Container.tsx'
import { motion } from 'motion/react'

import type { RootState } from '@/store/store'
import { createPortal } from 'react-dom'
import { useSelector } from 'react-redux'
import styles from './Me.module.scss'
import { useGetSeasonQuery } from '@/store/api/leaderboard.api'

const variants = {
	initial: { opacity: 0 },
	enter: { opacity: 1 },
}

const transition = {
	duration: 0.4,
	ease: 'easeInOut',
}

const Me: FC = () => {
	const selectedSeason = useSelector((state: RootState) => state.leaderboard.selectedSeason)
	const { data: leaderboardData } = useGetSeasonQuery(
		selectedSeason && 'id' in selectedSeason ? selectedSeason.id : undefined,
	)

	if (!selectedSeason || !leaderboardData) {
		return null
	}

	return createPortal (
		<motion.section
			className={styles.me}
			initial="initial"
			animate="enter"
			variants={variants}
			transition={transition}
		>
			<Container>
				<div className={styles.inner}>
					<Item
						position={leaderboardData.current_user?.place}
						avatar={leaderboardData.current_user?.pfp_url}
						name="You"
						earning={leaderboardData.current_user?.win_sum}
						opened={leaderboardData.current_user?.opened_count}
					/>
				</div>
			</Container>
		</motion.section>,
		document.body,
	)
}

export default Me
