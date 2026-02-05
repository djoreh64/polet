import type { FC } from 'react'
import { useNavigate } from 'react-router'

import useTranslation from '@/hooks/useTranslation.ts'

import GiftCard from '@/ui/GiftCard/GiftCard.tsx'
import Icon from '@/ui/Icon/Icon.tsx'

import styles from './Item.module.scss'
import type { SpinItem } from '@/store/api/profile.api'
import type { Rarity } from '@/ui/BackgroundPattern/BackgroundPattern'
import useOpenCase from '@/hooks/useOpenCase'
import { PrizeTypeEnum } from '@/store/api/content.api'

export type Action = 'won_prize' | 'sale' | 'withdraw'

interface ItemProps {
	action: Action
	spinItem: SpinItem
	date: string
	coins?: number
}

const Item: FC<ItemProps> = (props) => {
	const { action, spinItem, date, coins } = props
	const { t } = useTranslation()
	const rarityLowered = spinItem.rarity?.toLowerCase()
	const { setCase } = useOpenCase()

	const navigate = useNavigate()

	const isDepositGift = (spinItem as any)?.direct_telegram_gift != null && (spinItem as any)?.direct_telegram_gift?.gift != null
	const rarity = isDepositGift ? 'ton' : (spinItem.rarity as unknown as Rarity)

	return (
		<div
			className={styles.item}
			onClick={
				() => {
					if (spinItem.prize_type === PrizeTypeEnum.PROMOCODE) {
						return
					}
					else if (spinItem.prize_type === PrizeTypeEnum.GIFT) {
						setCase({ ...spinItem, type: PrizeTypeEnum.GIFT, id: spinItem.date, can_sell: false, can_withdraw: false, amount: spinItem.price.toString(), telegram_gift_template: {
							gift: spinItem.name,
							model: '',
							background: '',
						} })
					}
					else {
						setCase({ ...spinItem, type: PrizeTypeEnum.DUST, id: spinItem.date, can_sell: false, can_withdraw: false, amount: spinItem.price.toString() })
					}
					navigate(`/collection/${spinItem.date}`, {
						state: { from: 'activity' },
					})
				}
			}
		>
			<GiftCard file_url={spinItem.file_url} className={styles.img} rarity={rarity} gift={spinItem.prize_type} />
			<div className={styles.offer}>
				<h3 className={styles.title}>
					{action === 'sale' && t('collection.actions.card.sale')}
					{action === 'won_prize' && t('collection.actions.card.won_prize')}
					{action === 'withdraw' && t('collection.actions.card.withdraw')}
					<span
						style={{ color: `var(--color-rarity-${rarityLowered})` }}
					>
						{spinItem.name}
					</span>
				</h3>
				<div className={styles.date}>{date}</div>
			</div>
			<div className={styles.action}>
				{action === 'won_prize' && (
					<div className={styles.win}>+1</div>
				)}
				{action === 'sale' && coins && (
					<div className={styles.sale}>
						<span>{coins}</span>
						<Icon name="coin" width={20} height={20} />
					</div>
				)}
				{action === 'withdraw' && (
					<Icon name="withdraw" width={16} height={16} />
				)}
			</div>
		</div>
	)
}

export default Item
