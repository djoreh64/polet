import type { FC } from 'react'

import { useGetLeaderboardQuery } from '@/store/api/leaderboard.api'
import Head from '@/screens/Leaderboard/Head/Head.tsx'
import List from '@/screens/Leaderboard/List/List.tsx'
import Me from '@/screens/Leaderboard/Me/Me.tsx'

import SeasonBar from '@/screens/Leaderboard/SeasonBar/SeasonBar'
import SeasonsPopup from '@/screens/Leaderboard/SeasonsPopup/SeasonsPopup'
import Container from '@/ui/Container/Container'
import { motion } from 'motion/react'
import { useEffect } from 'react'

const variants = {
	initial: { opacity: 0 },
	enter: { opacity: 1 },
}

const transition = {
	duration: 0.4,
	ease: 'easeInOut',
}

const Leaderboard: FC = () => {
	const { refetch } = useGetLeaderboardQuery()
	useEffect(() => {
		refetch()
	}, [refetch])

	return (
		<motion.div
			style={{ overflow: 'scroll', height: '85vh' }}
			initial="initial"
			animate="enter"
			exit="initial"
			variants={variants}
			transition={transition}
		>
			<Container>
				<Head />
				<SeasonBar />
				<List />
				<Me />
				<SeasonsPopup />
			</Container>
		</motion.div>
	)
}

export default Leaderboard
