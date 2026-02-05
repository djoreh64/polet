/* eslint-disable react/no-array-index-key */
/* eslint-disable react-dom/no-missing-button-type */
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import styles from './Onboarding.module.scss'

import img1 from '@/assets/outborn-1.svg'
import img2 from '@/assets/outborn-2.png'
import { useDispatch } from 'react-redux'
import { setIsOnboarding } from '@/store/ui/uiSlice'
import { useCompleteTutorialMutation, useGetInfoQuery } from '@/store/api/profile.api'

const pages = [
	{
		id: 1,
		img: <img src={img1} alt="Welcome illustration" className={`${styles['onboarding-image']} ${styles['onboarding-image--type1']}`} />,
		title: 'Добро пожаловать в CHANCE',
		desc: (
			<>
				<p>
					Мир удачи, магии и ценных находок.
					<span className={styles.highlight}> Крути кристалл, получай</span>
					{' '}
					призы и обменивай их на TON.
					Каждое открытие — шанс на
					<span className={styles.highlight}> нечто редкое.</span>
				</p>

			</>
		),
		btn: 'Погнали!',
	},
	{
		id: 2,
		img: (
			<img
				src={img2}
				alt="Magic dust explanation"
				className={`${styles['onboarding-image']} ${styles['onboarding-image--type2']}`}
			/>
		),
		title: 'Готов открыть свой первый Кристалл?',
		desc: (
			<p>
				<span className={styles.highlight}>Пополни баланс</span>
				{' '}
				— ты можешь использовать
				<span className={styles.highlight}> TON или звёзды. </span>
				Выбирай, что удобнее — и вперёд к открытиям.
			</p>
		),
		btn: 'Ну все я в деле',
	},
]

function Onboarding() {
	const [currentPage, setCurrentPage] = useState(0)
	const { data: infoData } = useGetInfoQuery()
	const [completeTutorial] = useCompleteTutorialMutation()
	const router = useNavigate()
	const dispatch = useDispatch()

	useEffect(() => {
		if (infoData?.is_completed_tutorial) {
			dispatch(setIsOnboarding(false))
			router('/')
		}
	}, [router, infoData?.is_completed_tutorial, dispatch])

	const handleDragEnd = (_event: any, info: any) => {
		if (info.offset.x < -100 && currentPage === 0) {
			setCurrentPage(1)
		}
		else if (info.offset.x > 100 && currentPage === 1) {
			setCurrentPage(0)
		}
	}

	const completeOnboarding = () => {
		completeTutorial()
		dispatch(setIsOnboarding(true))
		router('/')
	}

	const handleClick = () => {
		if (currentPage < pages.length - 1) {
			setCurrentPage(prev => prev + 1)
		}
		else {
			completeOnboarding()
		}
	}

	return (
		<div className={styles.onboarding_container}>
			<AnimatePresence>
				<motion.div
					key={currentPage}
					drag="x"
					dragConstraints={{ left: 0, right: 0 }}
					dragElastic={0.2}
					onDragEnd={handleDragEnd}
					initial={{ x: 100, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					exit={{ x: -100, opacity: 0 }}
					transition={{ duration: 0.3 }}
					style={{ width: '100%', height: '100%' }}
				>
					<div className={styles.page}>
						{pages[currentPage].img}
						<div className={styles.text}>
							<h1>{pages[currentPage].title}</h1>
							<p>{pages[currentPage].desc}</p>
						</div>
						<button onClick={handleClick}>{pages[currentPage].btn}</button>

						<div className={styles.dots}>
							{pages.map((_, index) => (
								<div
									key={index}
									className={`${styles.dot} ${
										index === currentPage ? styles['dot--active'] : ''
									}`}
								/>
							))}
						</div>
					</div>
				</motion.div>
			</AnimatePresence>
		</div>
	)
}

export default Onboarding
