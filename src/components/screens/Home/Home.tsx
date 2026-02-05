import type { FC } from 'react'
import { useEffect } from 'react'

import CrystalSlider from '@/screens/Home/CrystalSlider/CrystalSlider'
import Drop from '@/screens/Home/Drop/Drop.tsx'
import Header from '@/screens/Home/Header/Header.tsx'

import Open from '@/screens/Home/Open/Open.tsx'

import Wins from '@/screens/Home/Wins/Wins.tsx'
import Navbar from '@/ui/Navbar/Navbar.tsx'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { setFirstOpen } from '@/store/ui/uiSlice'
import { PreviewModal } from '@/ui/PreviewModal/PreviewModal'
import { useGetInfoQuery } from '@/store/api/profile.api'

const variants = {
	initial: { opacity: 0 },
	enter: { opacity: 1 },
}

const transition = {
	duration: 0.4,
	ease: 'easeInOut',
}

const transitionFirstOpen = {
	duration: 0.9,
	ease: 'easeInOut',
}

const Home: FC = () => {
	const router = useNavigate()
	const isFirstOpen = useSelector((state: RootState) => state.ui.firstOpen)
	const dispatch = useDispatch()
	const { data: infoData } = useGetInfoQuery()
	useEffect(() => {
		if (infoData) {
			if (!infoData.is_completed_tutorial) {
				router('/preview')
			}

			const hasSeenThisSession = sessionStorage.getItem('hasSeenHomeAnimation')
			if (!hasSeenThisSession) {
				sessionStorage.setItem('hasSeenHomeAnimation', 'true')
			}

			if (hasSeenThisSession) {
				dispatch(setFirstOpen())
			}
		}
	}, [router, infoData, dispatch])

	return (
		<>
			<motion.div
				initial="initial"
				animate="enter"
				exit="initial"
				variants={variants}
				transition={isFirstOpen ? transitionFirstOpen : transition}
			>
				<Header />
				<Wins />
				<CrystalSlider />
				<Drop />
				<Open />
			</motion.div>
			<Navbar />
			<PreviewModal />
		</>
	)
}

export default Home
