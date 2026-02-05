import type { Rarity } from '@/ui/BackgroundPattern/BackgroundPattern.tsx'
import type { FC } from 'react'

import useTranslation from '@/hooks/useTranslation.ts'
import GiftCard from '@/ui/GiftCard/GiftCard.tsx'

import styles from './WinsCard.module.scss'

interface WinsCardProps {
	gift: {
		amount: string
		direct_telegram_gift: string | null
		file_url: string
		id: string
		promocode: string | null
		rarity: Rarity
		telegram_gift_template: {
			gift: string
			model: string | null
			background: string | null
		}
		type: string
	}
	user: {
		avatar: string
		username: string
	}
	onClick?: () => void
}

const WinsCard: FC<WinsCardProps> = ({ gift, user, onClick }) => {
	const { t } = useTranslation()

	return (
		<div
			className={styles.card}
			onClick={(e) => {
				e.stopPropagation()
				if (onClick) {
					onClick()
				}
			}}
		>
			<GiftCard rarity={gift?.rarity} gift={gift?.type} model={gift?.telegram_gift_template?.model || undefined} file_url={gift?.file_url} />
			<div>
				<div className={styles.user}>
					<img className={styles.avatar} src={user?.avatar} alt={`@${user?.username}`} />
					<span className={styles.username}>{`${user?.username}`}</span>
				</div>
				<p className={styles.text}>
					{t('home.wins.label')}
					<span>
						{' '}
						{gift?.telegram_gift_template?.gift}
					</span>
				</p>
			</div>
		</div>
	)
}

export default WinsCard
