import type { Rarity } from '@/ui/BackgroundPattern/BackgroundPattern.tsx'
import type { FC, HTMLAttributes } from 'react'
import { memo } from 'react'

import BackgroundPattern from '@/ui/BackgroundPattern/BackgroundPattern.tsx'
import Icon from '@/ui/Icon/Icon.tsx'

import cn from 'classnames'

import styles from './GiftCard.module.scss'
import type { UseGiftModelOptions } from '@/hooks/useGiftModel'
import { Player } from '@lottiefiles/react-lottie-player'
import { useGiftModel } from '@/hooks/useGiftModel'

interface GiftCardProps extends HTMLAttributes<HTMLDivElement> {
	size?: 'small' | 'large' | 'xl'
	rarity: Rarity
	gift: string
	model?: string
	file_url?: string
	// deprecated
	lottie?: string
	value?: string
	autoplay?: boolean
	options?: UseGiftModelOptions
	className?: string
}

const GiftCard: FC<GiftCardProps> = ({ size = 'small', rarity, autoplay = false, className, gift, model, value, options, lottie, file_url, ...props }) => {
	const { png } = useGiftModel(gift, model, options)

	const file = file_url ?? lottie

	const rarityLowered = rarity?.toLowerCase()
	return (
		<div
			className={cn(styles.card, styles[rarityLowered], className)}
			style={{ border: `1px solid var(--color-rarity-${rarityLowered}-40)` }}
			{...props}
		>
			<div className={styles.content}>
				{file?.includes('.json')
					? (
							<div className={cn(styles.img, styles[size], gift === 'promocode' && styles.promocode)}>
								<Player renderer="svg" src={file} loop autoplay={autoplay} />
							</div>
						)
					: (
							<img
								className={cn(styles.img, styles[size], gift === 'promocode' && styles.promocode)}
								style={{ display: 'block' }}
								src={file_url || png || undefined}
								alt={`${rarityLowered} gift`}
							/>
						)}
				{(size === 'large' || size === 'xl') && (
					<div
						className={styles.price}
						style={{ backgroundColor: `var(--color-rarity-${rarityLowered}-25)` }}
					>
						{value
							? (
									<>
										<span className={styles.value}>{value}</span>
										{gift !== 'promocode' ? <Icon name="ton" width={14} height={14} /> : null}
									</>
								)
							: null}

					</div>
				)}
			</div>
			<BackgroundPattern className={cn(styles.background, size === 'large' && styles.large)} rarity={rarity} />
		</div>
	)
}

export default memo(GiftCard)
