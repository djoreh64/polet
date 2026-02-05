import useTranslation from '@/hooks/useTranslation.ts'

import { close, open } from '@/store/ui/uiSlice'
import GiftCard from '@/ui/GiftCard/GiftCard.tsx'
import { useNavigate } from 'react-router'

import { motion } from 'motion/react'

import useOpenCase from '@/hooks/useOpenCase'
import useTelegram from '@/hooks/useTelegram'
import { useDonateGiftQuery } from '@/store/api/donate.api'
import type { RootState } from '@/store/store'
import Button from '@/ui/Button/Button'
import Container from '@/ui/Container/Container'
import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styles from './DepositGift.module.scss'

const variants = {
	initial: { opacity: 0 },
	enter: { opacity: 1 },
}

const transition = {
	duration: 0.4,
	ease: 'easeInOut',
}
function GiftDeposit() {
	const { t } = useTranslation()

	const { data: giftsData, isSuccess: isGiftsSuccess } = useDonateGiftQuery()

	const navigate = useNavigate()
	const { setCase } = useOpenCase()

	const { webApp } = useTelegram()
	const dispatch = useDispatch()
	const isOpen = useSelector((state: RootState) => state.ui.open)

	const buttonRef = useRef<HTMLButtonElement>(null)
	const popupRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		dispatch(close())
	}, [])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node
			if (
				popupRef.current && !popupRef.current.contains(target)
				&& buttonRef.current && !buttonRef.current.contains(target)
			) {
				dispatch(close())
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [dispatch])

	return (

		<motion.div
			initial="initial"
			animate="enter"
			variants={variants}
			transition={transition}
		>
			<Container className={styles.container}>
				<div className={styles.header}>
					<h3 className={styles.title}>
						<span className={styles.back}>{t('donate.withGift.btn')}</span>
						{t('donate.withGift.btn')}
						<span className={styles.front}>{t('donate.withGift.btn')}</span>
					</h3>
					<p className={styles.description}>
						{t('donate.withGift.description')}
					</p>
				</div>

				<div className={styles.list}>
					{isGiftsSuccess && giftsData?.gifts?.map((gift, index) => (
						<div
							key={index + gift.model}
							className={styles.link}
						>
							<GiftCard
								size="large"
								className={styles.card}
								rarity="ton"
								file_url={gift?.file_url}
								gift={gift?.gift}
								model={gift?.model}
								value={gift?.price}
							/>
						</div>
					))}
				</div>
				<div className={styles.block}></div>
				{/* Actions buttons */}
				<div className={styles.buttons}>
					<div className={styles.wrapper}>
						<Button className={styles.button} onClick={() => dispatch(open())} primary>{t('donate.deposit')}</Button>
						{isOpen && (
							<div ref={popupRef} className={styles.popup}>
								<div className={styles.tail} />
								<p className={styles.text}>
									{t('donate.withGift.bubble')}
									{' '}
									<span
										className={styles.link}
										onClick={() => webApp.openTelegramLink('https://t.me/chancegifts')}
									>
										@chancegifts
									</span>
								</p>
							</div>
						)}
					</div>

					<Button className={styles.button} onClick={() => navigate(-1)}>{t('donate.back')}</Button>
				</div>

			</Container>
		</motion.div>

	)
}

export default GiftDeposit
