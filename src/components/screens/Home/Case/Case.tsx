import useOpenCase from '@/hooks/useOpenCase.ts'
import { AnimatePresence, motion } from 'motion/react'
import type { FC } from 'react'
import { useState } from 'react'
import styles from './Case.module.scss'
import { useNavigate } from 'react-router'
import { Player } from '@lottiefiles/react-lottie-player'

interface CaseProps {
	openingAnimation: { opacity: number, transition: { duration: number } }
	staticAnimation: string
}

const Case: FC<CaseProps> = ({ openingAnimation, staticAnimation }) => {
	const { isOpening } = useOpenCase()

	const [isOpenRoulette, setIsOpenRoulette] = useState(false)

	const navigate = useNavigate()

	return (
		<AnimatePresence>
			{!isOpenRoulette
				? (
						<motion.div
							className={styles.crystal}
							initial={{ opacity: 1 }}
							animate={isOpening ? openingAnimation : { opacity: 1 }}
							onAnimationComplete={() => {
								if (isOpening) {
									setIsOpenRoulette(true)
									setTimeout(() => {
										navigate('/roulette')
									}, 600)
								}
							}}
						>
							<Player className={styles.animation} renderer="svg" src={staticAnimation} loop autoplay />
						</motion.div>
					)
				: (
						null
					)}

		</AnimatePresence>
	)
}

export default Case
