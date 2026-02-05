import type { Rarity } from '@/ui/BackgroundPattern/BackgroundPattern.tsx'
import type { CSSProperties, FC } from 'react'

import useTelegram from '@/hooks/useTelegram'
import BackgroundPattern from '@/ui/BackgroundPattern/BackgroundPattern.tsx'

import styles from './Card.module.scss'
import { Player } from '@lottiefiles/react-lottie-player'

interface CustomCSSProperties extends CSSProperties {
	'--shadow-color'?: string
}

interface CardProps {
	rarity: Rarity
	file_url: string
	slug?: string
	margin?: string
}

const Card: FC<CardProps> = ({ rarity, file_url, slug }) => {
	const rarityLowered = rarity?.toLowerCase()
	const { webApp } = useTelegram()

	return (
		<section className={styles.card} style={{ margin }}>
			<div className={styles.container}>
				<div
					className={styles.inner}
					style={{ border: `1px solid var(--color-rarity-${rarityLowered}-40)` }}
					onClick={() => slug ? webApp.openTelegramLink(`https://t.me/nft/${slug}`) : null}
				>
					{file_url.endsWith('.json') ? <Player className={styles.img} renderer="svg" src={file_url} loop autoplay /> : <img className={styles.img} src={file_url} alt={rarityLowered} />}
					<div
						className={styles.shadow}
						style={{
							'background': `var(--color-rarity-${rarityLowered}-40)`,
							'--shadow-color': `var(--color-rarity-${rarityLowered}-40)`,
						} as CustomCSSProperties}

					/>
					<BackgroundPattern className={styles.background} rarity={rarity} />
				</div>
			</div>
		</section>
	)
}

export default Card
