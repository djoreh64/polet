import { useEffect, useRef, useState } from 'react'
import type { FC } from 'react'
import { motion } from 'motion/react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'

import useTranslation from '@/hooks/useTranslation.ts'
import { useGetGiftsQuery, useGetInfoQuery, useSellAllGiftsMutation, useWithdrawGiftMutation } from '@/store/api/profile.api'
import { useGetConfigQuery } from '@/store/api/content.api'
import Button from '@/ui/Button/Button.tsx'
import Container from '@/ui/Container/Container.tsx'
import IconTon from '@/assets/icons/iconTon.svg?react'
import { close, open } from '@/store/ui/uiSlice'
import type { RootState } from '@/store/store'
import useTelegram from '@/hooks/useTelegram'
import Modal from '@/ui/Modal/Modal'
import ConfirmModal from '@/ui/Modal/ConfirmModal/ConfirmModal'
import InfoModal from '@/ui/Modal/InfoModal/InfoModal'
import { closeModal, openModal } from '@/store/modal/modalSlice'

import styles from './Actions.module.scss'
import WithdrawModal from '@/ui/Modal/WithdrawModal/WithdrawModal'

const variants = {
	initial: { opacity: 0 },
	enter: { opacity: 1 },
}

const transition = {
	duration: 0.4,
	ease: 'easeInOut',
}

const WithdrawActions: FC = () => {
	const [modalType, setModalType] = useState<'sell' | 'withdraw' | 'withdrawalsDisabled' | 'withdrawOptions' | null>(null)

	const { t } = useTranslation()

	const isOpen = useSelector((state: RootState) => state.ui.open)
	const dispatch = useDispatch()
	const [destination, setDestination] = useState<'portals' | 'telegram' | null>(null)

	const { data: giftsData, isSuccess: isGiftsSuccess, isLoading, isError } = useGetGiftsQuery({})
	const { data: infoData } = useGetInfoQuery()
	const { data: configData } = useGetConfigQuery()

	const [sellAllGifts] = useSellAllGiftsMutation()
	const [withdrawGift, { isError: isErrorWithdraw }] = useWithdrawGiftMutation()

	const { webApp } = useTelegram()

	const buttonRef = useRef<HTMLButtonElement>(null)
	const popupRef = useRef<HTMLDivElement>(null)

	const modalTitle
		= modalType === 'sell' ? t('collection.storage.confirm.sell.title') : t('collection.storage.confirm.withdraw.title')

	const modalText
		= modalType === 'sell' ? t('collection.storage.confirm.sell.text') : t('collection.storage.confirm.withdraw.text')

	const totalPrice = isGiftsSuccess
		? Math.round(
			giftsData.items.reduce(
				(sum, gift) => sum + Number.parseFloat(gift.sell_price),
				0,
			) * 10,
		) / 10
		: 0

	const handleSellButton = () => {
		setModalType('sell')
		dispatch(openModal())
	}

	const handleWithdrawButton = () => {
		// Проверяем доступность выводов
		if (configData && configData.withdrawals_enabled === false) {
			setModalType('withdrawalsDisabled')
			dispatch(openModal())
			return
		}
		setModalType('withdraw')
		dispatch(openModal())
	}

	async function handleActionButton(action: 'sell' | 'withdraw', destination?: 'portals' | 'telegram') {
		if (isLoading) {
			return
		}
		if (isError) {
			return
		}

		let giftIds: string[] = []
		if (isGiftsSuccess) {
			if (action === 'withdraw') {
				// Исключаем подарки с withdrawable_after, которые еще нельзя вывести
				const now = new Date()
				giftIds = giftsData.items
					.filter((gift) => {
						if (!gift.withdrawable_after) {
							return true
						}
						const withdrawableAfter = new Date(gift.withdrawable_after)
						return withdrawableAfter <= now
					})
					.map(gift => gift.id)
			}
			else {
				giftIds = giftsData.items.map(gift => gift.id)
			}
		}

		if (!giftIds || giftIds.length === 0) {
			return
		}

		try {
			if (action === 'sell') {
				await sellAllGifts({}).unwrap()
			}
			else if (action === 'withdraw') {
				if (destination) {
					setDestination(destination)
				}
				await Promise.all(
					giftIds.map(id => withdrawGift({ user_gift_id: id, destination }).unwrap()),
				)
			}
		}
		catch (error) {
			console.error(error)
		}
	}

	const handleConfirm = async () => {
		const action = modalType
		dispatch(closeModal())
		await new Promise(resolve => setTimeout(resolve, 500))
		if (action === 'sell') {
			await handleActionButton('sell')
			setModalType(null)
			return
		}
		if (action === 'withdraw') {
			setModalType('withdrawOptions')
			dispatch(openModal())
		}
	}

	const handleClose = () => {
		dispatch(closeModal())
		setModalType(null)
	}

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

	return createPortal(
		isGiftsSuccess && giftsData.items.length > 0 && infoData?.is_demo !== true
		&& (
			<>
				<motion.section
					className={styles.actions}
					initial="initial"
					animate="enter"
					variants={variants}
					transition={transition}
				>
					<Container className={styles.container}>
						<Button className={styles.button} onClick={() => handleSellButton()}>
							<span>{t('collection.storage.actions.sell')}</span>
							<div className={styles.label}>
								<span>{totalPrice}</span>
								<IconTon width={16} height={16} />
							</div>
						</Button>
						<div className={styles.wrapper}>
							<Button primary className={styles.button} onClick={() => handleWithdrawButton()}>
								{t('collection.storage.actions.withdraw')}
							</Button>
							{isOpen && (
								<div
									ref={popupRef}
									className={styles.popup}
								>
									<div className={styles.tail} />
									<p className={styles.text}>
										{destination === 'portals' ? t('withdrawBubble') : t('withdrawBubbleTelegram')}
									</p>
								</div>
							)}
						</div>
					</Container>
				</motion.section>
				{modalType === 'withdrawalsDisabled'
					? (
							<Modal type="info">
								<InfoModal
									title={t('gift.withdrawalsDisabled.alertTitle')}
									text={t('gift.withdrawalsDisabled.alertText')}
								/>
							</Modal>
						)
					: modalType === 'withdrawOptions'
						? (
								<Modal type="confirmation">
									<WithdrawModal
										title={t('gift.modal.withdrawMany.title')}
										text={t('gift.modal.withdrawMany.text')}
										isDirect={false}
										fees={{
											telegram: configData?.withdrawal_fee_template_telegram ?? 0,
											portals: configData?.withdrawal_fee_template_portals ?? 0,
										}}
										onSelect={async (destination) => {
											dispatch(closeModal())
											setModalType(null)
											await handleActionButton('withdraw', destination)
										}}
										onClose={handleClose}
									/>
								</Modal>
							)
						: (
								<Modal type="confirmation">
									<ConfirmModal
										title={modalTitle}
										text={modalText}
										onConfirm={handleConfirm}
										onClose={handleClose}
									/>
								</Modal>
							)}
			</>
		),
		document.body,
	)
}

export default WithdrawActions
