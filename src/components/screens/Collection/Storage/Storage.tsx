import type { FC } from 'react'

import { useGetAccountQuery, useGetGiftsQuery, useGetInfoQuery } from '@/api/profile.api.ts'
import useTranslation from '@/hooks/useTranslation.ts'

import GiftCard from '@/ui/GiftCard/GiftCard.tsx'
import useOpenCase from '@/hooks/useOpenCase'
import { useNavigate } from 'react-router'

import { motion } from 'motion/react'

import WithdrawActions from './Actions/Actions'
import styles from './Storage.module.scss'
import type { WonItem } from '@/store/api/game.api'
import type { Rarity } from '@/ui/BackgroundPattern/BackgroundPattern'

const variants = {
	initial: { opacity: 0 },
	enter: { opacity: 1 },
}

const transition = {
	duration: 0.4,
	ease: 'easeInOut',
}

const Storage: FC = () => {
	const { t } = useTranslation()

	const navigate = useNavigate()
	const { setCase } = useOpenCase()

	const { data: infoData } = useGetInfoQuery()
	const { data: giftsData, isSuccess: isGiftsSuccess } = useGetGiftsQuery({ page: 1, demo: infoData?.is_demo })

	return (

		<motion.div
			className={styles.storage}
			initial="initial"
			animate="enter"
			variants={variants}
			transition={transition}
		>
			<div className={styles.head}>
				<h1 className={styles.title}>{t('collection.storage.title')}</h1>
			</div>
			<div className={styles.body}>
				{isGiftsSuccess && giftsData?.items?.map((gift) => {
					// Депозитные подарки определяются по наличию direct_telegram_gift
					const isDepositGift = gift?.direct_telegram_gift != null && gift?.direct_telegram_gift?.gift != null
					const rarity = isDepositGift ? 'ton' : (gift?.rarity as unknown as Rarity)
					return (
						<div
							key={gift?.id}
							className={styles.link}
							onClick={() => {
								setCase(gift as unknown as WonItem)
								navigate(`/collection/${gift.id}`)
							}}
						>
							<GiftCard
								size="xl"
								className={styles.card}
								rarity={rarity}
								gift={gift?.type}
								file_url={gift?.file_url}
								model={gift?.telegram_gift_template?.model}
								value={gift?.amount || `${gift.promocode?.deposit_bonus}%`}
							/>
						</div>
					)
				})}
			</div>
			<WithdrawActions />
		</motion.div>
	)
}

export default Storage
