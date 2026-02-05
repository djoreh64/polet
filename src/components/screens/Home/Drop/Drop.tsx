import type { RootState } from '@/store/store'
import type { FC, MouseEventHandler } from 'react'
import useOpenCase from '@/hooks/useOpenCase.ts'
import useTranslation from '@/hooks/useTranslation.ts'
import Container from '@/ui/Container/Container.tsx'
import GiftCard from '@/ui/GiftCard/GiftCard.tsx'
import Icon from '@/ui/Icon/Icon.tsx'
import cn from 'classnames'
import { setIsShowDropModal } from '@/store/ui/uiSlice'

import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styles from './Drop.module.scss'
import { AnimatePresence, motion } from 'motion/react'
import type { Rarity } from '@/ui/BackgroundPattern/BackgroundPattern'

const dropdownVariants = {
	closed: {
		y: '300px',
		transition: {
			duration: 0.4,
			ease: 'easeInOut',
			delay: 0.2, // Ждем пока элементы внутри анимируются
		},
	},
	open: {
		y: 0,
		transition: {
			duration: 0.4,
			ease: 'easeInOut',
		},
	},
}

const overlayVariants = {
	closed: {
		opacity: 0,
		transition: {
			duration: 0.4,
			ease: 'easeInOut',
			delay: 0.4,
		},
	},
	open: {
		opacity: 1,
		transition: {
			duration: 0.3,
			ease: 'easeInOut',
		},
	},
}

const wrapperVariants = {
	initial: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.8,
			ease: 'easeInOut',
		},
	},
	animate: {
		opacity: 0,
		y: '100%',
		transition: {
			duration: 0.8,
			ease: 'easeInOut',
		},
	},
}

const buttonVariants = {
	closed: {
		y: '280px',
		opacity: 0,
		transition: {
			duration: 0.4,
			ease: 'easeInOut',
			delay: 0.2,
		},
	},
	open: {
		y: 0,
		opacity: 1,
		transition: {
			duration: 0.4,
			ease: 'easeInOut',
		},
	},
	initial: {
		y: 10,
		opacity: 1,
		transition: {
			y: {
				duration: 0,
			},
			opacity: {
				duration: 0.5,
				ease: 'easeInOut',
			},
		},
	},
}

const Drop: FC = () => {
	const { isOpening } = useOpenCase()
	const ref = useRef<HTMLDivElement>(null)
	const [buttonAnimationState, setButtonAnimationState] = useState<'initial' | 'open' | 'closed'>('initial')
	const [isClosing, setIsClosing] = useState(false)

	const currentCrystal = useSelector((state: RootState) => state.crystals.currentCrystal)
	const isShowDropModal = useSelector((state: RootState) => state.ui.isShowDropModal)

	const dispatch = useDispatch()

	useLayoutEffect(() => {
		if (isShowDropModal) {
			setIsClosing(false)
			setButtonAnimationState('open')
		}
		else if (!isShowDropModal && buttonAnimationState === 'open') {
			setIsClosing(true)
			setButtonAnimationState('closed')
			// После завершения анимации closed возвращаем в initial
			const timer = setTimeout(() => {
				setButtonAnimationState('initial')
				setIsClosing(false)
			}, 850) // 400ms анимация + 200ms delay
			return () => clearTimeout(timer)
		}
	}, [isShowDropModal])

	const allRewards = currentCrystal?.rewards ?? []

	const handleWrapButtonClick = () => {
		if (isClosing) {
			return
		}
		dispatch(setIsShowDropModal(!isShowDropModal))
	}

	const handleClickOutside: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
		if (ref.current && !ref.current.contains(event.target as Node)) {
			dispatch(setIsShowDropModal(false))
		}
	}, [dispatch])

	const { t } = useTranslation()

	return (
		<AnimatePresence>
			<motion.section
				className={styles.drop}
				initial="animate"
				animate={isOpening ? 'animate' : 'initial'}
				exit="animate"
				variants={wrapperVariants}
			>
				<Container>
					<div className={styles.head}>
						<motion.button
							className={cn(styles.button, isShowDropModal && styles.active)}
							onClick={handleWrapButtonClick}
							type="button"
							initial="initial"
							animate={buttonAnimationState}
							variants={buttonVariants}
						>
							<span>{t('home.drop.title')}</span>
							<Icon
								name="chevron-up"
								width={20}
								height={20}
								className={cn(styles.icon, isShowDropModal && styles.rotate)}
							/>
						</motion.button>
					</div>
					<AnimatePresence mode="wait">
						{isShowDropModal && (
							<>
								<motion.div
									className={styles.overlay}
									initial="closed"
									animate="open"
									exit="closed"
									variants={overlayVariants}
									onClick={handleClickOutside}
								/>

								<motion.div
									ref={ref}
									className={styles.body}
									initial="closed"
									animate="open"
									exit="closed"
									variants={dropdownVariants}
								>
									{allRewards.length > 0
										&& splitArray(allRewards).map((row, rowIndex) => {
											const totalRows = 4
											const reverseDelay = (totalRows - 1 - rowIndex) * 0.05

											return (
												<motion.div
													className={styles.row}
													key={`row-${rowIndex}`}
													initial={{ opacity: 0, y: 20 }}
													animate={{
														opacity: 1,
														y: 0,
														transition: {
															duration: 0.4,
															ease: 'easeInOut',
															delay: rowIndex * 0.1,
														},
													}}
													exit={{
														opacity: 0,
														y: 20,
														transition: {
															duration: 0.3,
															ease: 'easeInOut',
															delay: reverseDelay,
														},
													}}
												>
													{row.map((reward, index) => {
														const reverseItemDelay = reverseDelay + (row.length - 1 - index) * 0.03

														return (
															<motion.div
																key={reward.id}
																initial={{ opacity: 0, scale: 0.8 }}
																animate={{
																	opacity: 1,
																	scale: 1,
																	transition: {
																		duration: 0.3,
																		ease: 'easeOut',
																		delay: rowIndex * 0.1 + index * 0.05,
																	},
																}}
																exit={{
																	opacity: 0,
																	scale: 0.8,
																	transition: {
																		duration: 0.25,
																		ease: 'easeIn',
																		delay: reverseItemDelay,
																	},
																}}
															>
																<GiftCard
																	file_url={reward?.file_url}
																	size="large"
																	className={styles.card}
																	rarity={reward?.rarity as Rarity}
																	gift={reward?.type}
																	model={reward?.gift?.model}
																	value={reward?.amount}
																/>
															</motion.div>
														)
													})}
												</motion.div>
											)
										})}
								</motion.div>
							</>
						)}
					</AnimatePresence>
				</Container>
			</motion.section>
		</AnimatePresence>
	)
}

function splitArray<T>(arr: T[] = []): [T[], T[], T[], T[]] {
	return [
		arr.slice(0, 4),
		arr.slice(4, 8),
		arr.slice(8, 12),
		arr.slice(12, 16),
	]
}

export default Drop
