import type { FC } from 'react'
import { useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { motion } from 'motion/react'

import Container from '@/ui/Container/Container'
import Case from '@/screens/Home/Case/Case'
import Open from '@/screens/Home/Open/Open'
import { ProgressBar } from '@/screens/FreeCases/ProgressBar/ProgressBar'
import ClaimBtn from '@/screens/FreeCases/ClaimBtn/ClaimBtn'

import { useGetCasesQuery } from '@/store/api/content.api'
import { useGetAccountQuery } from '@/store/api/profile.api'
import { setCurrentCrystal } from '@/store/openCase/crystalSlice'

import useOpenCase from '@/hooks/useOpenCase'
import useTranslation from '@/hooks/useTranslation'

import blueStatic from '@/animations/blue-static.json'
import pepe from '@/assets/pepe_icon.png'
import LockIcon from '@/assets/icons/lock.svg?react'

import styles from './FreeCases.module.scss'
import Modal from '@/ui/Modal/Modal'
import InfoModal from '@/ui/Modal/InfoModal/InfoModal'

const variants = {
	initial: { opacity: 0 },
	enter: { opacity: 1 },
}

const transition = {
	duration: 0.4,
	ease: 'easeInOut',
}

const STATIC_ANIMATIONS = {
	opacity: 0,
	transition: { duration: 0.5 },
}

const CRYSTAL_ANIMATIONS = {
	id: 1,
	open: STATIC_ANIMATIONS,
	static: blueStatic,
}

const WRAPPER_VARIANTS = {
	initial: { opacity: 1 },
	animate: { opacity: 0 },
}

const FreeCases: FC = () => {
	const { data: casesData } = useGetCasesQuery()
	const { data: accountData } = useGetAccountQuery()
	const { isOpening } = useOpenCase()
	const { t } = useTranslation()
	const dispatch = useDispatch()

	const freeCaseCrystals = useMemo(() => {
		return casesData?.filter(crystal => crystal.type === 'pepes') ?? []
	}, [casesData])

	const firstFreeCrystal = useMemo(() => {
		return freeCaseCrystals[0] || null
	}, [freeCaseCrystals])

	const requiredTickets = firstFreeCrystal?.price ?? 0
	const userTickets = accountData?.pepes ?? 0

	const canPlayFreeCase = useMemo(() => {
		return userTickets >= Number(requiredTickets) && Number(requiredTickets) > 0
	}, [userTickets, requiredTickets])

	const hasFreeCrystals = freeCaseCrystals.length > 0

	useEffect(() => {
		if (firstFreeCrystal) {
			dispatch(setCurrentCrystal(firstFreeCrystal))
		}
	}, [firstFreeCrystal, dispatch])

	return (
		<>
			<Container className={styles.content}>
				<motion.div
					initial="initial"
					animate="enter"
					exit="initial"
					variants={variants}
					transition={transition}
				>
					<motion.div
						initial="initial"
						animate={isOpening && 'animate'}
						transition={{ duration: 0.3 }}
						className={styles.wrapper}
						variants={WRAPPER_VARIANTS}
					>
						<h3 className={styles.title}>
							{t('freeCases.title')}
						</h3>

						<div className={styles.imgWrapper}>
							<div className={styles.img}>
								<img
									src={pepe}
									alt="pepe"
									width={80}
									height={80}
								/>
								<img
									className={styles.stars}
									src="/img/stars-fx.png"
									alt="stars effect"
								/>
							</div>
							<ClaimBtn />
						</div>

						<p className={styles.description}>
							{t('freeCases.description')}
						</p>

						<ProgressBar
							value={userTickets}
							max={Number(requiredTickets)}
						/>
					</motion.div>

					<div className={styles.caseWrapper}>
						{(!canPlayFreeCase || !hasFreeCrystals) && !isOpening && (
							<div className={styles.blured}>
								<LockIcon
									width={40}
									height={40}
									className={styles.lockIcon}
								/>
							</div>
						)}

						<Case
							openingAnimation={STATIC_ANIMATIONS}
							staticAnimation={firstFreeCrystal?.file_url ?? ''}
						/>

						{hasFreeCrystals && (
							<Open
								disabled={!canPlayFreeCase}
								freeCase
							/>
						)}
					</div>
				</motion.div>
			</Container>
			<Modal type="info">
				<InfoModal
					title={t('freeCases.info.title')}
					text={t('freeCases.info.text')}
				/>
			</Modal>

		</>
	)
}

export default FreeCases
