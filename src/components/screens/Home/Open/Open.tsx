import type { RootState } from '@/store/store'

import type { FC } from 'react'

import { usePlayGameMutation } from '@/api/game.api.ts'
import Coin from '@/assets/icons/iconTon.svg?react'
import useOpenCase from '@/hooks/useOpenCase.ts'

import useTranslation from '@/hooks/useTranslation.ts'
import Button from '@/ui/Button/Button.tsx'

import Container from '@/ui/Container/Container.tsx'
import { motion } from 'motion/react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router'
import styles from './Open.module.scss'
import { useGetAccountQuery, useGetInfoQuery } from '@/store/api/profile.api'
import { setOrigin } from '@/store/navigation/navigationSlice'
import { openModal } from '@/store/modal/modalSlice'

const variants = {
	initial: { opacity: 0 },
	enter: { opacity: 1 },
}

const transition = {
	duration: 0.4,
	ease: 'easeInOut',
}

const wrapperVariants = {
	initial: { opacity: 1, y: 0 },
	animate: {
		opacity: 0,
		y: 180,
		transition: {
			duration: 0.6,
			ease: 'easeInOut',
			delay: 0.7,
		},
	},
}

interface Props {
	freeCase?: boolean
	disabled?: boolean
}

const Open: FC<Props> = ({ freeCase = false, disabled = false }) => {
	const { isOpening, openCase } = useOpenCase()
	const { data: infoData } = useGetInfoQuery()
	const { data: accountData } = useGetAccountQuery()
	const navigate = useNavigate()
	const location = useLocation()
	const dispatch = useDispatch()

	const currentCrystal = useSelector((state: RootState) => state.crystals.currentCrystal)

	const { t } = useTranslation()

	const [playGame, { data: playGameData, isSuccess: isPlayGameSuccess, isLoading }] = usePlayGameMutation()

	const handleOpenCaseButton = () => {
		dispatch(setOrigin(location.pathname))
		console.log('location.pathname', location.pathname)

		if (!currentCrystal || !infoData) {
			return
		}

		if (freeCase) {
			if (infoData.is_demo) {
				dispatch(openModal())
				return
			}
			if (accountData?.pepes && accountData.pepes > 0) {
				playGame({ case_id: currentCrystal.id })
			}
			return
		}

		if (infoData?.is_demo ? accountData?.demo_balance : accountData?.balance && Number.parseFloat(currentCrystal.price) <= (infoData?.is_demo ? accountData?.demo_balance : accountData?.balance)) {
			playGame({ case_id: currentCrystal.id })
		}
		else {
			navigate('/deposit')
		}
	}

	useEffect(() => {
		if (isPlayGameSuccess && playGameData.won_item) {
			openCase(playGameData.won_item)
		}
	}, [isPlayGameSuccess, navigate, openCase, playGameData])

	return createPortal(
		<motion.section
			className={styles.open}
			initial="initial"
			animate="enter"
			variants={variants}
			transition={transition}
		>
			<Container>
				<motion.div initial="initial" animate={isOpening && 'animate'} variants={wrapperVariants}>
					<Button className={`${styles.button} ${freeCase ? styles.free : ''} ${disabled ? styles.disabled : ''}`} primary disabled={isLoading || isOpening || disabled} onClick={handleOpenCaseButton}>
						<span>{freeCase ? t('home.free') : t('home.button')}</span>
						{!freeCase && (
							<div className={styles.label}>
								<span>{currentCrystal && currentCrystal.price}</span>
								<Coin width={16} height={16} />
							</div>
						)}
					</Button>
				</motion.div>
			</Container>
		</motion.section>,
		document.body,
	)
}

export default Open
