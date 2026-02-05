import type { Rarity } from '@/ui/BackgroundPattern/BackgroundPattern.tsx'
import type { FC } from 'react'

import Container from '@/ui/Container/Container.tsx'
import Icon from '@/ui/Icon/Icon.tsx'

import styles from './Head.module.scss'

interface HeadProps {
	rarity: Rarity
	title: string
	number: number
	price: string
}

const Head: FC<HeadProps> = ({ rarity, title, number, price }) => {
	const rarityLowered = rarity?.toLowerCase()
	return (
		<section className={styles.head}>
			<Container className={styles.container}>
				<div>
					<div
						className={styles.rarity}
						style={{
							border: `2px solid var(--color-rarity-${rarityLowered}-40)`,
							color: `var(--color-rarity-${rarityLowered})`,
						}}
					>
						{rarityLowered}
					</div>
					<h1 className={styles.title}>{title}</h1>
				</div>
				<div className={styles.price}>
					<div className={styles.value}>
						<span>{price}</span>
						<Icon name="ton" width={18} height={18} />
					</div>
					<div className={styles.label}>Floor Price</div>
				</div>
			</Container>
		</section>
	)
}

export default Head
