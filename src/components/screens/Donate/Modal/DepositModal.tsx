import type { RootState } from '@/store/store'
import { beginCell } from '@ton/ton'
import type { FC } from 'react'

import IconGift from '@/assets/icons/iconGift.svg?react'
import TonIcon from '@/assets/icons/iconTon.svg?react'

import useTelegram from '@/hooks/useTelegram'
import useTranslation from '@/hooks/useTranslation'
import { useDonateStarsMutation } from '@/store/api/donate.api'
import { useGetAccountQuery, useGetInfoQuery } from '@/store/api/profile.api'
import { closeDepositModal } from '@/store/modal/depositModalSlice'
import Button from '@/ui/Button/Button'

import Container from '@/ui/Container/Container'
import { showTelegramErrorPopup } from '@/utils/telegramError'
import type { SendTransactionRequest } from '@tonconnect/ui-react'
import { useTonAddress, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { CryptoPayComponent } from './CryptoPay/CryptoPayButton'
import styles from './DepositModal.module.scss'
import CurrencySwitcher from '@/screens/Donate/Modal/CurrencySwitcher/CurrencySwitcher'

function toNanoDecimal(amount: number | string): string {
	return (Number(amount) * 1e9).toFixed(0)
}

type Currency = 'ton' | 'stars'

const backdropVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: 20 },
}

const destinationAddress = import.meta.env.VITE_TON_ADDRESS ?? 'UQD6JK-K0btibJRmJEVnk0qAe54GgmSQBMkqvrVxlZTo0S7X'

const DepositModal: FC = () => {
	const { webApp } = useTelegram()
	const [currency, setCurrency] = useState<Currency>('stars')
	const [amount, setAmount] = useState<number | ''>('')
	const [isShowInfo, setIsShowInfo] = useState<boolean>(false)

	const { data: accountData } = useGetAccountQuery()
	const { data: profileData } = useGetInfoQuery()
	const [donateStars] = useDonateStarsMutation()

	const userFriendlyAddress = useTonAddress()
	const wallet = useTonWallet()
	const [tonConnectUI] = useTonConnectUI()

	const handleDeposit = async () => {
		if (Number(amount) < 0.1) {
			setIsShowInfo(true)
			return
		}
		if (currency === 'stars') {
			if (Number(amount) > 380) {
				showTelegramErrorPopup('Не превышай 380 тон за раз')
				return
			}
			try {
				const response = await donateStars({ amount: Number(amount) })
				if (response?.data?.invoice_url) {
					webApp.openInvoice(response.data.invoice_url, () => {})
				}
			}
			catch (error) {
				console.error('Ошибка отправки stars', error)
				showTelegramErrorPopup('Не удалось отправить звезды')
			}
		};

		if ((!wallet || !destinationAddress) && currency === 'ton') {
			return
		}

		if (currency === 'ton' && accountData?.payment_id) {
			const payload = beginCell()
				.storeUint(0, 32)
				.storeStringTail(accountData.payment_id)
				.endCell()
				.toBoc()
				.toString('base64')

			const transaction: SendTransactionRequest = {
				validUntil: Math.floor(Date.now() / 1000) + 60, // транзакция действительна 60 сек
				messages: [
					{
						address: destinationAddress, // адрес получателя TON
						amount: toNanoDecimal(amount),
						payload,

					},
				],
			}
			try {
				await tonConnectUI.sendTransaction(transaction)
				showTelegramErrorPopup('Транзакция отправлена')
			}
			catch (error) {
				console.error('Ошибка отправки', error)
				showTelegramErrorPopup('Не удалось отправить транзакцию')
			}
		}
		setIsShowInfo(false)
	}

	const { t } = useTranslation()

	const dispatch = useDispatch()
	const isOpen = useSelector((state: RootState) => state.depositModal.isOpen)
	const navigate = useNavigate()

	if (!isOpen) {
		return null
	}

	const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			dispatch(closeDepositModal())
		}
	}

	return createPortal (
		<motion.div
			className={styles.modal}
			onClick={handleBackdropClick}
			variants={backdropVariants}
			initial="hidden"
			animate="visible"
			exit="exit"
			transition={{ duration: 0.2, ease: 'easeInOut' }}
		>
			<Container className={styles.container}>

				<div className={styles.header}>
					<h3 className={styles.title}>
						<span className={styles.back}>{t('donate.deposit')}</span>
						{t('donate.deposit')}
						<span className={styles.front}>{t('donate.deposit')}</span>
					</h3>
					<p className={styles.description}>
						{t('donate.subtitle')}
					</p>
				</div>
				<div className={styles.inputSection}>

					<label className={styles.field}>
						<TonIcon className={styles.icon} width={20} height={20} />
						<input
							className={styles.input}
							name="coins"
							placeholder="0"
							type="number"
							value={amount}
							onChange={(e) => {
								setAmount(e.target.value === '' ? '' : Number(e.target.value))
							}}
						/>

						<CurrencySwitcher currency={currency} setCurrency={setCurrency} />
					</label>
					{isShowInfo && <p className={styles.info}>{t('donate.info')}</p>}
					<div className={styles.row}>

						<div className={styles.row__sale} style={{ visibility: 'hidden' }}>+10% free </div>

						<div className={styles.balance} style={{ margin: 0 }}>
							<span className={styles.label}>{t('donate.balance')}</span>
							<span>{profileData?.is_demo ? accountData?.demo_balance : accountData?.balance}</span>
							<TonIcon width={16} height={16} />
						</div>
					</div>
				</div>

				{currency === 'stars' || userFriendlyAddress
					? (

							<Button primary className={styles.button} onClick={handleDeposit}>
								{t(`donate.depositBtn.${currency}`)}
							</Button>

						)
					: (

							<Button primary className={styles.button} onClick={() => tonConnectUI.modal.open()}>
								Connect Wallet
							</Button>

						) }
				<CryptoPayComponent amount={Number(amount)} setIsShowInfo={setIsShowInfo} />
				<Button
					secondary
					className={styles.button}
					onClick={() => {
						navigate('/gift-deposit')

						dispatch(closeDepositModal())
					}}
				>
					<IconGift width={16} height={16} />

					{t(`donate.withGift.btn`)}

				</Button>

			</Container>
		</motion.div>,
		document.body,
	)
}

export default DepositModal
