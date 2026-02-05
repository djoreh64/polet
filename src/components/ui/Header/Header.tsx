import type { FC } from 'react'

import { useGetAccountQuery, useGetInfoQuery, useToggleDemoModeMutation } from '@/api/profile.api.ts'
import useOpenCase from '@/hooks/useOpenCase.ts'
import { useEffect, useState } from 'react'

import Balance from '@/ui/Balance/Balance'
import Container from '@/ui/Container/Container.tsx'
import LangSwitcher from '@/ui/Header/LangSwitcher/LangSwitcher.tsx'
import Tickets from '@/ui/Header/Tickets/Tickets'

import { useLocation } from 'react-router'

import styles from './Header.module.scss'
import { motion } from 'motion/react'
import { setIsPepeAvailable } from '@/store/ui/uiSlice'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { closeModal, openModal } from '@/store/modal/modalSlice'
import Modal from '@/ui/Modal/Modal'
import ConfirmModal from '@/ui/Modal/ConfirmModal/ConfirmModal'
import useTranslation from '@/hooks/useTranslation'
import cn from 'classnames'

const Header: FC = () => {
	const location = useLocation()

	const { data: infoData, isSuccess: isInfoSuccess } = useGetInfoQuery()
	const { data: accountData } = useGetAccountQuery()
	const { isOpening } = useOpenCase()
	const [toggleDemoMode] = useToggleDemoModeMutation()
	const { t } = useTranslation()

	const dispatch = useDispatch()
	const gameBalanceOverride = useSelector((state: RootState) => state.ui.gameBalanceOverride)

	const [tickets, setTickets] = useState<number | undefined>(undefined)
	const [balance, setBalance] = useState<number | undefined>(undefined)
	const [showDemoModal, setShowDemoModal] = useState(false)

	// Отображаемый баланс: если есть override от игры — используем его
	const displayedBalance = gameBalanceOverride !== null ? gameBalanceOverride : balance

	useEffect(() => {
		if (!isOpening && isInfoSuccess) {
			setTickets(accountData?.pepes)
			setBalance(infoData?.is_demo ? accountData?.demo_balance : accountData?.balance)
		}
	}, [isOpening, isInfoSuccess, accountData, infoData])

	useEffect(() => {
		if (accountData && accountData.next_pepe_claim_at) {
			const date = new Date(accountData.next_pepe_claim_at)
			const timeLeft = date.getTime() - Date.now()

			if (timeLeft <= 0) {
				dispatch(setIsPepeAvailable(true))
			}
		}
	}, [infoData, dispatch])

	const handleDemoModeClick = async () => {
		const newDemoModeValue = !infoData?.is_demo

		try {
			await toggleDemoMode(newDemoModeValue).unwrap()
			dispatch(closeModal())
			setShowDemoModal(false)
		} catch (error) {
			console.error('Ошибка переключения демо-режима', error)
		}
	}

	const handleDemoToggle = () => {
		setShowDemoModal(true)
		dispatch(openModal())
	}

	const handleCloseDemoModal = () => {
		setShowDemoModal(false)
		dispatch(closeModal())
	}

	const wrapperVariants = {
		initial: { opacity: 1, transition: {
			opacity: {
				duration: 0.6,
				ease: 'easeInOut',
				delay: 0,
			},
			y: {
				duration: 0,
			},
		} },
		animate: {
			opacity: 0,
			y: -50,
			transition: {
				duration: 0.5,
				ease: 'easeInOut',
				delay: 0.4,
			},
		},
	}

	return (
		<>
			{isInfoSuccess && (
				<>
					<motion.header initial="initial" animate={isOpening ? 'animate' : 'initial'} variants={wrapperVariants} className={styles.header}>
						<Container className={styles.container}>
							{location.pathname === '/plane-game' ? (
								<div className={styles.planeGameHeader}>
									<div className={cn(styles.demoMode, styles.demoSwitchPlane)}>
										<div className={styles.demoMode__label}>{t(`donate.demo`)}</div>
										<input
											type="checkbox"
											className={cn(styles.demoMode__checkbox, infoData?.is_demo ? styles.checkboxActive : null)}
											checked={infoData?.is_demo}
											onChange={handleDemoToggle}
										/>
									</div>
									<Balance amount={displayedBalance} depositButton />
								</div>
							) : (
								<>
									<div className={styles.leftSection}>
										<Balance amount={displayedBalance} depositButton />
									</div>
									{
										location.pathname === '/' || location.pathname === '/free-cases' || location.pathname === '/plane-game-first-page'
											? <Tickets amount={tickets ?? accountData?.pepes} />
											: location.pathname === '/collection' ? <LangSwitcher /> : null
									}
								</>
							)}
						</Container>
					</motion.header>
					{showDemoModal && (
						<Modal type="balanceScreen">
							<ConfirmModal
								title={infoData?.is_demo ? t(`donate.demo_title_left`) : t(`donate.demo_title`)}
								text={infoData?.is_demo ? t(`donate.demo_desk_left`) : t(`donate.demo_desk`)}
								onConfirm={handleDemoModeClick}
								onClose={handleCloseDemoModal}
							/>
						</Modal>
					)}
				</>
			)}
		</>
	)
}

export default Header
