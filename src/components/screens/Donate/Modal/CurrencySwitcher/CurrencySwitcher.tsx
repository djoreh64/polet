import styles from './CurrencySwitcher.module.scss'
import TgStarIcon from '@/assets/icons/iconTgstars.svg?react'
import TonIcon from '@/assets/icons/iconTon.svg?react'

type Currency = 'ton' | 'stars'

interface CurrencySwitcherProps {
	currency: Currency
	setCurrency: (currency: Currency) => void
	percent?: number
}

export default function CurrencySwitcher({ currency, percent, setCurrency }: CurrencySwitcherProps) {
	return (
		<div className={styles.switcher}>
			{(percent && percent > 1)
				? (
						<div className={styles.salePlank}>
							{percent.toFixed(0)}
							%
						</div>
					)
				: null}
			<button
				type="button"
				className={`${styles.iconButton} ${currency === 'ton' ? styles.active : styles.inactive}`}
				onClick={() => setCurrency('ton')}
			>
				<TonIcon width={20} height={20} />
			</button>

			<button
				type="button"
				className={`${styles.iconButton} ${currency === 'stars' ? styles.active : styles.inactive}`}
				onClick={() => setCurrency('stars')}
			>
				<TgStarIcon width={20} height={20} />
			</button>
		</div>
	)
}
