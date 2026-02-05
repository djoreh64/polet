import type { FC } from 'react'

import { useGetGiftsQuery, useGetInfoQuery, useSellGiftMutation, useWithdrawGiftMutation } from '@/store/api/profile.api'
import IconTon from '@/assets/icons/iconTon.svg?react'
import { close, open } from '@/store/ui/uiSlice'

import useTranslation from '@/hooks/useTranslation.ts'
import Button from '@/ui/Button/Button.tsx'
import Container from '@/ui/Container/Container.tsx'
import Modal from '@/ui/Modal/Modal.tsx'

import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useMatch, useNavigate, useParams } from 'react-router'

import useOpenCase from '@/hooks/useOpenCase'
import styles from './Actions.module.scss'
import useTelegram from '@/hooks/useTelegram'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import ConfirmModal from '@/ui/Modal/ConfirmModal/ConfirmModal'
import InfoModal from '@/ui/Modal/InfoModal/InfoModal'
import { closeModal, openModal } from '@/store/modal/modalSlice'
import { PrizeTypeEnum, useGetConfigQuery } from '@/store/api/content.api'
import { calculateTimeRemaining, formatTimer, pluralize } from '@/utils/utils'
import WithdrawModal from '@/ui/Modal/WithdrawModal/WithdrawModal'

const variants = {
	initial: { opacity: 0 },
	enter: { opacity: 1 },
}

const transition = {
	duration: 0.4,
	ease: 'easeInOut',
}

interface ActionsProps {
	canSell: boolean
	canWithdraw: boolean
	sellPrice: number
	customstyle?: any
}

const Actions: FC<ActionsProps> = ({ sellPrice }) => {
	const { t, language } = useTranslation()
	const { caseItem, resetCase } = useOpenCase()

	const isOwnedGift = Boolean(caseItem)

	const matchCollection = useMatch('/collection/:giftId')
	const isCollection = matchCollection !== null

	const showActions = isOwnedGift

	const navigate = useNavigate()
	const params = useParams<{ giftId: string }>()
	const giftId = params.giftId

	const isGift = caseItem?.type === PrizeTypeEnum.GIFT

	const [modalType, setModalType] = useState<'sell' | 'withdraw' | 'timer' | 'withdrawalsDisabled' | null>(null)
	const [withdrawableAfter, setWithdrawableAfter] = useState<string | null>(null)
	const [timerDisplay, setTimerDisplay] = useState<string | null>(null)
	const [timerText, setTimerText] = useState<string>('')

	const { webApp } = useTelegram()

	const buttonRef = useRef<HTMLButtonElement>(null)
	const popupRef = useRef<HTMLDivElement>(null)

	const isOpen = useSelector((state: RootState) => state.ui.open)
	const dispatch = useDispatch()

	const { data: infoData } = useGetInfoQuery()
	const { data: giftsData } = useGetGiftsQuery({ page: 1, demo: infoData?.is_demo })
	const { data: configData } = useGetConfigQuery()
	const [sellGift, { isSuccess: isSellSuccess }] = useSellGiftMutation()
	const [withdrawGift, { isSuccess: isWithdrawSuccess, isError: isErrorWithdraw }] = useWithdrawGiftMutation()

	// Получаем withdrawable_after из данных подарка
	useEffect(() => {
		if (isCollection && giftId && giftsData?.items) {
			const gift = giftsData.items.find(g => g.id === giftId)
			if (gift?.withdrawable_after) {
				setWithdrawableAfter(gift.withdrawable_after)
			}
		}
		else if (caseItem && (caseItem as any).withdrawable_after) {
			setWithdrawableAfter((caseItem as any).withdrawable_after)
		}
	}, [isCollection, giftId, giftsData, caseItem])

	// Обновляем таймер каждую секунду
	useEffect(() => {
		if (!withdrawableAfter) {
			setTimerDisplay(null)
			setTimerText('')
			return
		}

		const targetDate = new Date(withdrawableAfter)
		const updateTimer = () => {
			const remaining = calculateTimeRemaining(targetDate)
			if (remaining) {
				// Показываем таймер только если до вывода больше 5 секунд
				const totalSeconds = remaining.days * 24 * 60 * 60 + remaining.hours * 60 * 60 + remaining.minutes * 60 + remaining.seconds

				if (totalSeconds > 5) {
					setTimerDisplay(formatTimer(remaining))
					// Форматируем текст для модального окна
					const parts: string[] = []
					const lang = language as 'ru' | 'en'

					if (remaining.days > 0) {
						const daysWord = lang === 'ru'
							? pluralize(remaining.days, ['день', 'дня', 'дней'], 'ru')
							: pluralize(remaining.days, ['day', 'days'], 'en')
						parts.push(`${remaining.days} ${daysWord}`)
					}

					if (remaining.hours > 0) {
						const hoursWord = lang === 'ru'
							? pluralize(remaining.hours, ['час', 'часа', 'часов'], 'ru')
							: pluralize(remaining.hours, ['hour', 'hours'], 'en')
						parts.push(`${remaining.hours} ${hoursWord}`)
					}

					if (remaining.minutes > 0) {
						const minutesWord = lang === 'ru'
							? pluralize(remaining.minutes, ['минуту', 'минуты', 'минут'], 'ru')
							: pluralize(remaining.minutes, ['minute', 'minutes'], 'en')
						parts.push(`${remaining.minutes} ${minutesWord}`)
					}

					if (remaining.seconds > 0 || parts.length === 0) {
						const secondsWord = lang === 'ru'
							? pluralize(remaining.seconds, ['секунду', 'секунды', 'секунд'], 'ru')
							: pluralize(remaining.seconds, ['second', 'seconds'], 'en')
						parts.push(`${remaining.seconds} ${secondsWord}`)
					}

					setTimerText(parts.join(', '))
				}
				else {
					// Если меньше 5 секунд - скрываем таймер, показываем обычный текст
					setTimerDisplay(null)
					setTimerText('')
					setWithdrawableAfter(null)
				}
			}
			else {
				setTimerDisplay(null)
				setTimerText('')
				setWithdrawableAfter(null)
			}
		}

		updateTimer()
		const interval = setInterval(updateTimer, 1000)

		return () => clearInterval(interval)
	}, [withdrawableAfter, language])

	const isDepositGift = (caseItem as any)?.direct_telegram_gift != null && (caseItem as any)?.direct_telegram_gift?.gift != null

	const handleSellButton = () => {
		setModalType('sell')
		dispatch(openModal())
	}

	const handleWithdrawButton = () => {
		// Приоритет проверок: Таймер -> Можно ли вывести -> Выбор направления
		if (withdrawableAfter && timerDisplay) {
			// Показываем таймер только если он отображается (больше 5 секунд до вывода)
			setModalType('timer')
			dispatch(openModal())
			return
		}
		// Проверяем доступность выводов
		if (configData && configData.withdrawals_enabled === false) {
			setModalType('withdrawalsDisabled')
			dispatch(openModal())
			return
		}
		// Если таймер не показывается и выводы доступны - обычное подтверждение
		setModalType('withdraw')
		dispatch(openModal())
	}

	const handleCollectButton = () => {
		navigate('/')
	}

	const handleWithdraw = async (destination: 'portals' | 'telegram') => {
		if (isCollection && giftId) {
			withdrawGift({ user_gift_id: giftId, destination })
		}
		else if (isGift) {
			withdrawGift({ user_gift_id: caseItem?.id, destination })
		}
		dispatch(closeModal())
		await new Promise(resolve => setTimeout(resolve, 2000))
		navigate('/collection')
	}

	const handleConfirm = async () => {
		if (modalType === 'sell') {
			if (isCollection && giftId) {
				sellGift({ user_gift_id: giftId })
			}
			else if (isGift) {
				sellGift({ user_gift_id: caseItem?.id })
			}
			else {
				return
			}
		}
		else if (modalType === 'withdraw') {
			// This path is now handled by WithdrawModal and handleWithdraw
			return
		}
		dispatch(closeModal())
		await new Promise(resolve => setTimeout(resolve, 2000))
		navigate('/collection')
	}

	const handleClose = () => {
		dispatch(closeModal())
		resetCase()
	}

	const modalTitle
		= modalType === 'sell' ? t('confirmation.sell.title') : t('confirmation.withdraw.title')

	const modalText
		= modalType === 'sell' ? t('confirmation.sell.text') : t('confirmation.withdraw.text')

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				(popupRef.current
					&& !popupRef.current.contains(event.target as Node))
				|| (buttonRef.current
					&& !buttonRef.current.contains(event.target as Node))
			) {
				dispatch(close())
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	})

	useEffect(() => {
		if (isErrorWithdraw) {
			dispatch(open())
		}
	}, [dispatch, isErrorWithdraw])

	useEffect(() => {
		if (isSellSuccess || isWithdrawSuccess) {
			navigate('/')
			resetCase()
		}
	}, [isSellSuccess, isWithdrawSuccess, navigate, resetCase])

	return createPortal(
		<>
			<motion.section
				className={cn(styles.actions, customstyle)}
				initial="initial"
				animate="enter"
				variants={variants}
				transition={transition}
			>
				<Container className={styles.container}>
					{showActions && (
						<>
							<Button className={styles.button} onClick={handleSellButton}>
								<span>{t('gift.actions.sell')}</span>
								<div className={styles.label}>
									<span>{sellPrice}</span>
									<IconTon name="coin" width={16} height={16} />
								</div>
							</Button>
							{isCollection
								? (

										<div className={styles.wrapper}>
											<Button className={styles.button} onClick={handleWithdrawButton} primary>
												{timerDisplay || t('gift.actions.withdraw')}
											</Button>
											{isOpen && (
												<div
													ref={popupRef}
													className={styles.popup}
												>
													<div className={styles.tail} />
													<p className={styles.text}>
														{t('withdrawBubble')}
													</p>
												</div>
											)}
										</div>
									)
								: (
										<Button className={styles.button} onClick={handleCollectButton} primary>
											{t('gift.actions.collect')}
										</Button>
									)}
						</>
					)}
				</Container>
			</motion.section>
			{modalType === 'timer'
				? (
						<Modal type="info">
							<InfoModal
								title={t('gift.withdrawTimer.alertTitle')}
								text={`${t('gift.withdrawTimer.alertText')} ${timerText}.`}
							/>
						</Modal>
					)
				: modalType === 'withdrawalsDisabled'
					? (
							<Modal type="info">
								<InfoModal
									title={t('gift.withdrawalsDisabled.alertTitle')}
									text={t('gift.withdrawalsDisabled.alertText')}
								/>
							</Modal>
						)
					: modalType === 'withdraw'
						? (
								<Modal type="confirmation">
									<WithdrawModal
										isDirect={isDepositGift}
										fees={{
											telegram: isDepositGift
												? (configData?.withdrawal_fee_direct_telegram ?? 0)
												: (configData?.withdrawal_fee_template_telegram ?? 0),
											portals: isDepositGift
												? (configData?.withdrawal_fee_direct_portals ?? 0)
												: (configData?.withdrawal_fee_template_portals ?? 0),
										}}
										onSelect={handleWithdraw}
										onClose={handleClose}
									/>
								</Modal>
							)
						: (
								<Modal type="confirmation">
									<ConfirmModal
										title={modalTitle}
										text={modalText}
										fee={isDepositGift
											? configData?.sell_fee_direct
											: configData?.sell_fee_template}
										onConfirm={handleConfirm}
										onClose={handleClose}
									/>
								</Modal>
							)}
		</>,
		document.body,
	)
}

export default Actions
