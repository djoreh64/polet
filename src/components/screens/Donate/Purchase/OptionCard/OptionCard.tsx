import type { FC } from 'react'

import TgStarIcon from '@/assets/icons/iconTgstars.svg?react'
import TonIcon from '@/assets/icons/iconTon.svg?react'
import BackgroundPattern from '@/ui/BackgroundPattern/BackgroundPattern.tsx'

import styles from './OptionCard.module.scss'

interface OptionCardProps {
	purchasedAmount: number
	paymentCurrency?: 'ton' | 'stars'
	paymentAmount: number
}

const OptionCard: FC<OptionCardProps> = ({ purchasedAmount, paymentCurrency = 'stars', paymentAmount }) => {
	return (
		<div className={styles.card}>
			<div className={styles.content}>
				<div className={styles.reward}>
					<span>{purchasedAmount}</span>
					<TonIcon width={24} height={24} />
				</div>
				<div className={styles.price}>
					<span className={styles.value}>{paymentAmount}</span>
					{paymentCurrency === 'ton' ? <TonIcon width={16} height={16} /> : <TgStarIcon width={16} height={16} />}
				</div>
			</div>
			<BackgroundPattern rarity="tickets" />
		</div>
	)
}

export default OptionCard
