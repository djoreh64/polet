import type { FC } from 'react'
import { useEffect } from 'react'

import useOpenCase from '@/hooks/useOpenCase.ts'
import useTranslation from '@/hooks/useTranslation'
import Actions from '@/screens/Gift/Actions/Actions.tsx'
import Card from '@/screens/Gift/Card/Card.tsx'
import styles from './Gift.module.scss'

import Head from '@/screens/Gift/Head/Head.tsx'
import Button from '@/ui/Button/Button'
import { salePrice } from '@/utils/utils.ts'
import { motion } from 'motion/react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import EmptyGift from './EmptyGift/EmptyGift'
import PromoPrize from '@/screens/Gift/PromoPrize/PromoPrize'
import { PrizeTypeEnum } from '@/store/api/content.api'
import type { Rarity } from '@/ui/BackgroundPattern/BackgroundPattern'
import Table from './Table/Table'
import PromoCode from '@/ui/PromoCode/PromoCode'

const variants = {
	initial: { opacity: 0 },
	enter: { opacity: 1 },
}

const transition = {
	duration: 0.6,
	ease: 'easeInOut',
}

const Gift: FC = () => {
	const { caseItem, isOpening, setCase } = useOpenCase()

	useEffect(() => {
		if (caseItem && isOpening) {
			setCase(caseItem)
		}
	}, [caseItem, isOpening, setCase])

	const { t } = useTranslation()
	const navigate = useNavigate()

	const from = useLocation().state?.from
	const fromActivity = from === 'activity'

	if (caseItem === null) {
		return <Navigate to="/collection" />
	}

	// Депозитные подарки определяются по наличию direct_telegram_gift
	const isDepositGift = (caseItem as any)?.direct_telegram_gift != null && (caseItem as any)?.direct_telegram_gift?.gift != null
	const rarity = isDepositGift ? 'ton' : (caseItem.rarity as unknown as Rarity)

	if (caseItem.type === PrizeTypeEnum.DUST) {
		return (
			<motion.div
				initial="initial"
				animate="enter"
				exit="initial"
				variants={variants}
				transition={transition}
				style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', height: '85vh' }}
			>
				<EmptyGift />

				<div className={styles.buttonWrapper}>
					<Button className={styles.button} onClick={() => navigate(fromActivity ? `/collection?tab=activity` : '/')}>{t('donate.back')}</Button>
				</div>
			</motion.div>
		)
	}

	if (caseItem.type === PrizeTypeEnum.PROMOCODE) {
		return (
			<>
				<motion.div
					initial="initial"
					animate="enter"
					exit="initial"
					variants={variants}
					transition={transition}
					style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', height: '85vh' }}
				>
					<PromoPrize fromActivity={fromActivity} />
				</motion.div>
				<PromoCode fromActivity={fromActivity} isCollection={false} code={caseItem?.id || ''} />
			</>
		)
	}

	const gift = (caseItem.telegram_gift_template ?? caseItem.direct_telegram_gift)!
	// Для предметов из инвентаря сервер отдаёт готовую цену продажи `sell_price`.
	// Для предметов не из инвентаря (например, сразу после открытия кейса) — фолбэк на расчёт по комиссии.
	const sellPriceFromApiRaw = (caseItem as any)?.sell_price
	const sellPriceFromApi = sellPriceFromApiRaw != null
		? Number.parseFloat(String(sellPriceFromApiRaw))
		: Number.NaN

	return (
		<>
			<motion.div
				initial="initial"
				animate="enter"
				exit="initial"
				variants={variants}
				transition={transition}
				className={styles.container}
			>
				<Card
					rarity={rarity}
					file_url={caseItem.file_url}
					slug={caseItem.id ?? ''}
				/>
				<Head
					rarity={caseItem.rarity}
					title={gift
						?.gift
						?? ''}
					number={extractNumber(caseItem.id ?? '')!}
					price={caseItem.amount ?? '0'}
				/>
				<Table
					model={{ text: gift.model ?? undefined }}
					backdrop={{ text: gift.background ?? undefined }}
					symbol={{ text: gift.symbol ?? undefined }}
				/>
			</motion.div>
			{(caseItem.can_sell || caseItem.can_withdraw) && !fromActivity
				? (
						<Actions
							canSell={caseItem.can_sell}
							canWithdraw={caseItem.can_withdraw}
							sellPrice={Number.isFinite(sellPriceFromApi)
								? sellPriceFromApi
								: salePrice(
										Number.parseFloat(caseItem.amount ?? '0'),
										isDepositGift
											? (configData?.sell_fee_direct ?? 0)
											: (configData?.sell_fee_template ?? 0),
									)}
						/>
					)
				: (
						<div className={styles.buttonWrapper}>
							<Button className={styles.button} onClick={() => navigate(fromActivity ? `/collection?tab=activity` : '/')}>{t('donate.back')}</Button>
						</div>
					)}
		</>

	)
}

function extractNumber(s: string): number | null {
	const parts = s.split('-')
	if (parts.length > 1) {
		return Number(parts[1])
	}
	return null
}

export default Gift
