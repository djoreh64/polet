import styles from './balanceScreen.module.scss'
import type { FC } from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import TonIcon from '@/assets/icons/iconTon.svg?react'
import IconGift from '@/assets/icons/iconGift.svg?react'
import { useNavigate } from 'react-router'
import type { SendTransactionRequest } from '@tonconnect/ui-react'
import { useTonAddress, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'
import useTelegram from '@/hooks/useTelegram'
import { useGetAccountQuery, useGetInfoQuery, useToggleDemoModeMutation } from '@/api/profile.api'
import { useDonateStarsMutation } from '@/api/donate.api'
import { showTelegramErrorPopup } from '@/utils/telegramError'
import { beginCell } from '@ton/ton'
import Button from '@/ui/Button/Button'
import useTranslation from '@/hooks/useTranslation'
import CurrencySwitcher from '@/screens/Donate/Modal/CurrencySwitcher/CurrencySwitcher'
import Icon from '@/ui/Icon/Icon'
import { CryptoPayComponent } from '@/screens/Donate/Modal/CryptoPay/CryptoPayButton'
import cn from 'classnames'
import type { PromocodeSuccessResponse } from '@/api/promocode.api'
import { useActivatePromocodeMutation } from '@/api/promocode.api'
import Modal from '@/ui/Modal/Modal'
import ConfirmModal from '@/ui/Modal/ConfirmModal/ConfirmModal'
import { closeModal, openModal } from '@/store/modal/modalSlice'
import { useDispatch } from 'react-redux'
import { pluralize } from '@/utils/utils'
import { motion } from 'motion/react'

type Currency = 'ton' | 'stars'
const destinationAddress = import.meta.env.VITE_TON_ADDRESS ?? 'UQD6JK-K0btibJRmJEVnk0qAe54GgmSQBMkqvrVxlZTo0S7X'

function toNanoDecimal(amount: number | string): string {
	return (Number(amount) * 1e9).toFixed(0)
}

const variants = {
	initial: { opacity: 0 },
	enter: { opacity: 1 },
}

const transition = {
	duration: 0.4,
	ease: 'easeInOut',
}

const BalanceScreen: FC = () => {
	const { webApp } = useTelegram()
	const wallet = useTonWallet()
	const [tonConnectUI] = useTonConnectUI()
	const { data: infoData, isSuccess } = useGetInfoQuery()
	const { data: accountData } = useGetAccountQuery()
	const [donateStars] = useDonateStarsMutation()
	const [activatePromocode, { isLoading: isPromocodeLoading }] = useActivatePromocodeMutation()
	const [toggleDemoMode] = useToggleDemoModeMutation()

	const userFriendlyAddress = useTonAddress()
	const { t, language } = useTranslation()
	const navigate = useNavigate()

	const [currency, setCurrency] = useState<Currency>('stars')
	const [amount, setAmount] = useState<number | ''>('')
	const [showValidate, setShowValidate] = useState<boolean>(false)
	const [promocode, setPromocode] = useState('')
	const [promocodeData, setPromocodeData] = useState<PromocodeSuccessResponse | null>(null)
	const [arePortalsReady, setArePortalsReady] = useState(false)

	const [isAmountInputFocused, setIsAmountInputFocused] = useState(false)
	const [isPromocodeInputFocused, setIsPromocodeInputFocused] = useState(false)

	const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
	const initialViewportHeight = useRef(window.innerHeight)
	const [promocodeMessage, setPromocodeMessage] = useState<string | null>(null)
	const [modalType, setModalType] = useState<'demo' | 'stars' | null>(null)
	const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

	const dispatch = useDispatch()

	const handleClose = () => {
		setModalType(null)
		dispatch(closeModal())
	}

	useLayoutEffect(() => {
		const handleResize = () => {
			const newHeight = window.innerHeight
			const calculatedKeyboardHeight = initialViewportHeight.current - newHeight

			if ((isAmountInputFocused || isPromocodeInputFocused) && calculatedKeyboardHeight > 150) {
				setIsKeyboardVisible(true)
			}
			else {
				setIsKeyboardVisible(false)
			}
		}

		window.addEventListener('resize', handleResize)

		return () => {
			window.removeEventListener('resize', handleResize)
		}
	}, [isAmountInputFocused, isPromocodeInputFocused])

	useEffect(() => {
		let footerPortalRoot = document.getElementById('footer-portal-root')
		if (!footerPortalRoot) {
			footerPortalRoot = document.createElement('div')
			footerPortalRoot.setAttribute('id', 'footer-portal-root')
			document.body.appendChild(footerPortalRoot)
		}

		let footerBackPortalRoot = document.getElementById('footer-back-portal-root')
		if (!footerBackPortalRoot) {
			footerBackPortalRoot = document.createElement('div')
			footerBackPortalRoot.setAttribute('id', 'footer-back-portal-root')
			document.body.appendChild(footerBackPortalRoot)
		}

		let overlayPortalRoot = document.getElementById('overlay-portal-root')
		if (!overlayPortalRoot) {
			overlayPortalRoot = document.createElement('div')
			overlayPortalRoot.setAttribute('id', 'overlay-portal-root')
			document.body.appendChild(overlayPortalRoot)
		}

		// eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
		setArePortalsReady(true)

		return () => {
			const fRoot = document.getElementById('footer-portal-root')
			if (fRoot && document.body.contains(fRoot)) {
				document.body.removeChild(fRoot)
			}
			const fbRoot = document.getElementById('footer-back-portal-root')
			if (fbRoot && document.body.contains(fbRoot)) {
				document.body.removeChild(fbRoot)
			}
			const oRoot = document.getElementById('overlay-portal-root')
			if (oRoot && document.body.contains(oRoot)) {
				document.body.removeChild(oRoot)
			}
		}
	}, [])

	const handleDeposit = async () => {
		const amountNum = Number(amount)
		if (amountNum < 0.1 || amountNum > 200) {
			setShowValidate(true)
			return
		}
		setShowValidate(false)
		if (currency === 'stars') {
			if (amountNum > 200) {
				setShowValidate(true)
				return
			}
			try {
				dispatch(closeModal())
				const response = await donateStars({ amount: amountNum })
				if (response?.data?.invoice_url) {
					webApp.openInvoice(response.data.invoice_url, () => { })
				}
			}
			catch (error) {
				dispatch(closeModal())
				console.error('Ошибка отправки stars', error)
				showTelegramErrorPopup(t('donate.cant_send_stars'))
			}
			return
		}
		if (currency === 'ton') {
			if (!wallet || !destinationAddress || !isSuccess || !accountData?.payment_id) {
				return
			}
			try {
				const payload = beginCell().storeUint(0, 32).storeStringTail(accountData.payment_id).endCell().toBoc().toString('base64')
				const transaction: SendTransactionRequest = {
					validUntil: Math.floor(Date.now() / 1000) + 60,
					messages: [{
						address: destinationAddress,
						amount: toNanoDecimal(amountNum),
						payload,
					}],
				}
				await tonConnectUI.sendTransaction(transaction)
				showTelegramErrorPopup(t('donate.transaction_send'))
			}
			catch (error) {
				console.error('Ошибка отправки ton', error)
				showTelegramErrorPopup(t('donate.transaction_cant_send'))
			}
		}
	}

	const handleDemoModeClick = async () => {
		const newDemoModeValue = !infoData?.is_demo

		try {
			await toggleDemoMode(newDemoModeValue).unwrap()
			dispatch(closeModal())
			if (!infoData?.is_demo) {
				await new Promise(resolve => setTimeout(resolve, 1000))
				navigate('/')
			}
		}
		catch (error) {
			console.error('Ошибка переключения демо-режима', error)
			showTelegramErrorPopup(t('donate.promocodes.demo_failed'))
		}
	}

	const handleActivatePromocode = async () => {
		if (!promocode) {
			setPromocodeMessage(t('donate.promocodes.enter_promo'))
			return
		}

		setPromocodeData(null)
		setPromocodeMessage(null)

		try {
			const result = await activatePromocode({ code: promocode }).unwrap()
			if (result.success) {
				setPromocodeData(result)

				if (!result.promocode.pepes_amount && !result.promocode.ton_amount && !result.promocode.deposit_bonus) {
					setPromocodeMessage(t('donate.promocodes.success_promo'))
				}
			}
			else {
				const translatedMessage = t(`donate.promocodes.${result.promocode.code as string}`)
				setPromocodeMessage(translatedMessage)
			}
		}
		catch (error) {
			const errorMessage = (error as any)?.data?.error_code
			const translatedMessage = t(`donate.promocodes.${errorMessage}`)
			setPromocodeMessage(translatedMessage)
		}
	}

	const handleRemovePromocode = () => {
		setPromocodeData(null)
		setPromocode('')
	}

	const isMobile = window.innerWidth <= 768

	useEffect(() => {
		if (isIOS && isPromocodeInputFocused && isKeyboardVisible) {
			const timeoutId = setTimeout(() => {
				const input = document.querySelector(`.${styles.footer__opts__promoField} input`)
				if (input) {
					input.scrollIntoView({ behavior: 'smooth', block: 'end' })
				}
			}, 100)
			return () => clearTimeout(timeoutId)
		}
	}, [isIOS, isPromocodeInputFocused, isKeyboardVisible])

	return (
		<motion.div
			initial="initial"
			animate="enter"
			exit="initial"
			variants={variants}
			transition={transition}
			className={styles.helpWrapper}
		>
			<div
				className={styles.contentWrapper}
				style={{
					transform: isPromocodeInputFocused && isKeyboardVisible ? `translateY(-200px)` : 'translateY(0)',
				}}
			>
				<div className={styles.balance}>
					<div className={styles.balance__mode}>
						<div>{t(`donate.demo`)}</div>
						<input
							type="checkbox"
							className={cn(styles.balance__mode__checkbox, infoData?.is_demo ? styles.checkboxActive : null)}
							checked={infoData?.is_demo}
							onChange={() => {
								setModalType('demo')
								dispatch(openModal())
							}}
						/>
					</div>
				</div>
				<div className={styles.title}>{t(`donate.deposit`)}</div>
				<div className={styles.desc}>{t(`donate.subtitle`)}</div>
				<div className={styles.balanceLabel}>
					<div className={styles.balanceLabel__value}>
						{t(`donate.balance`)}
						{' '}
						<span>{infoData?.is_demo ? accountData?.demo_balance : accountData?.balance}</span>
					</div>
					<TonIcon width={20} height={20} />
				</div>
				<label className={styles.balanceForm}>
					<input
						name="coins"
						placeholder="0"
						type="number"
						value={amount}
						onChange={(e) => {
							setAmount(e.target.value === '' ? '' : Number(e.target.value))
						}}
						onFocus={() => setIsAmountInputFocused(true)}
						onBlur={() => setIsAmountInputFocused(false)}
					/>
					<CurrencySwitcher currency={currency} percent={accountData?.deposit_bonus_percent} setCurrency={setCurrency} />
				</label>
				{showValidate && <p className={styles.info}>{t('donate.info')}</p>}
				<div className={styles.formButtons}>
					<CryptoPayComponent percent={accountData?.deposit_bonus_percent} customClass={styles.formButtons__item} amount={Number(amount)} setIsShowInfo={setShowValidate} />
					<Button
						secondary
						percent={accountData?.deposit_bonus_percent}
						className={styles.formButtons__item}
						onClick={() => { navigate('/gift-deposit') }}
					>
						<IconGift width={16} height={16} />
						{t(`donate.withGift.btn`)}
					</Button>
				</div>
			</div>
			<Modal type="balanceScreen">
				<ConfirmModal
					title={modalType !== 'demo' ? t(`donate.deposit_stars`) : infoData?.is_demo ? t(`donate.demo_title_left`) : t(`donate.demo_title`)}
					text={modalType !== 'demo' ? t(`donate.deposit_stars_desk`) : infoData?.is_demo ? t(`donate.demo_desk_left`) : t(`donate.demo_desk`)}
					onConfirm={modalType !== 'demo' ? handleDeposit : handleDemoModeClick}
					onClose={handleClose}
				/>
			</Modal>

			{arePortalsReady && (
				<>
					{ReactDOM.createPortal(
						<div
							className={cn(styles.footer, {
								[styles.hiddenOnKeyboard]: isMobile && isKeyboardVisible && isAmountInputFocused,
							})}
							style={{
								bottom: isMobile && isPromocodeInputFocused && isKeyboardVisible
									? `16px`
									: '104px',
							}}
						>
							<div className={styles.footer__opts}>
								<div className={styles.footer__opts__promoField}>
									<input
										type="text"
										placeholder={t(`donate.promocodes.promo`)}
										value={promocode}
										style={{ width: (!!promocode && promocode.length > 0 ? '68px' : '112px') }}
										onChange={e => setPromocode(e.target.value)}
										onFocus={() => setIsPromocodeInputFocused(true)}
										onBlur={() => setIsPromocodeInputFocused(false)}
									/>
								</div>
								{(!!promocode && promocode.length > 0) && (
									<div className={styles.footer__opts__remove} onClick={promocodeData ? handleRemovePromocode : handleActivatePromocode}>
										{promocodeData
											? (
													<Icon name="cancel" width={20} height={20} />
												)
											: (
													isPromocodeLoading ? '...' : <Icon name="confirm" width={20} height={20} />
												)}
									</div>
								)}
							</div>

							{promocodeData && promocodeData.promocode.deposit_bonus && (
								<div
									className={styles.promoPopup}
									style={{ bottom: '72px' }}
								>
									{t(`donate.promocodes.accept_promo.first`)}
									{' '}
									<span>
										{`+${promocodeData?.promocode.deposit_bonus ?? 0}%`}
									</span>
									{' '}
									{t(`donate.promocodes.accept_promo.second`)}
								</div>
							)}

							{ promocodeData && promocodeData.promocode.pepes_amount && (
								<div className={styles.promoPopup} style={{ bottom: '72px' }}>
									{t(`donate.promocodes.accept_promo.first`)}
									{' '}
									<span>
										{promocodeData.promocode.pepes_amount ?? 0}
										{' '}
										{pluralize(
											promocodeData.promocode.pepes_amount ?? 0,
											language === 'ru' ? ['Пепу', 'Пепы', 'Пеп'] : ['Pepe', 'Pepes'],
											language,
										)}
									</span>

								</div>
							)}

							{promocodeData && promocodeData.promocode.ton_amount && (
								<div className={styles.promoPopup} style={{ bottom: '72px' }}>
									{t(`donate.promocodes.accept_promo.first`)}
									{' '}
									<span>
										{promocodeData.promocode.ton_amount ?? 0}
										{' '}
										TON
									</span>

								</div>
							)}

							{promocodeMessage && (

								<div
									className={styles.promoPopup}
									style={{ bottom: '72px' }}
								>
									{promocodeMessage}
								</div>
							)}

							{currency === 'stars' || userFriendlyAddress
								? (
										<Button
											primary
											className={styles.footer__connect}
											onClick={() => {
												if (currency === 'stars') {
													if (Number(amount) < 0.1 || Number(amount) > 200) {
														setShowValidate(true)
													}
													else {
														setShowValidate(false)
														setModalType('stars')
														dispatch(openModal())
													}
												}
												else {
													handleDeposit()
												}
											}}
										>
											{t(`donate.depositBtn.${currency}`)}
										</Button>
									)
								: (
										<Button primary className={styles.footer__connect} onClick={() => tonConnectUI.modal.open()}>
											{t(`donate.connect_wallet`)}
										</Button>
									)}
						</div>,
						document.getElementById('footer-portal-root') as HTMLElement,
					)}

					{ReactDOM.createPortal(
						<div
							className={cn(styles.footerBack, { [styles.hiddenOnKeyboard]: isKeyboardVisible })}
							onClick={() => navigate(-1)}
						>
							{t(`donate.back`)}
						</div>,
						document.getElementById('footer-back-portal-root') as HTMLElement,
					)}
				</>
			)}
		</motion.div>
	)
}

export default BalanceScreen
