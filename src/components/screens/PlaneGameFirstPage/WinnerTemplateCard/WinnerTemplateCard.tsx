import type { FC } from 'react'

import TonIcon from '@/assets/icons/iconTon.svg?react'

import styles from './WinnerTemplateCard.module.scss'

interface WinnerTemplateCardProps {
	nickname: string
	amount: string
	baseAmount: string
	multiplier: string
	avatarUrl?: string | null
}

const WinnerTemplateCard: FC<WinnerTemplateCardProps> = ({ nickname, amount, baseAmount, multiplier, avatarUrl }) => (
	<div className={styles.card}>
		<div className={styles.top}>
			{avatarUrl ? <img className={styles.avatar} src={avatarUrl} alt="" /> : <div className={styles.avatar} />}
			<span className={styles.nickname}>{nickname}</span>
		</div>
		<div className={styles.bottom}>
			<span className={styles.amount}>{amount}</span>
			<TonIcon className={styles.currency} width={20} height={20} />
			<div className={styles.detail}>
				<span>{baseAmount}</span>
				<TonIcon width={14} height={14} />
				<span>{multiplier}</span>
			</div>
		</div>
	</div>
)

export default WinnerTemplateCard
