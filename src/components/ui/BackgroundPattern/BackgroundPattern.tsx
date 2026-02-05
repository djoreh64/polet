import { memo } from 'react'
import type { FC, SVGProps } from 'react'

import Common from '@/assets/backgrounds/comon-bg.svg?react'
import Rare from '@/assets/backgrounds/rare-bg.svg?react'
import Divine from '@/assets/backgrounds/divine-bg.svg?react'
import Epic from '@/assets/backgrounds/epic-bg.svg?react'
import Mythic from '@/assets/backgrounds/mythic.svg?react'
import Legendary from '@/assets/backgrounds/legendary.svg?react'
import Tickets from '@/assets/backgrounds/tickets-bg.svg?react'
import Ton from '@/assets/backgrounds/ton-bg.svg?react'
import cn from 'classnames'

import styles from './BackgroundPattern.module.scss'

export type Rarity = 'common' | 'rare' | 'epic' | 'mythic' | 'legendary' | 'divine' | 'tickets' | 'ton'

interface BackgroundPatternProps extends SVGProps<SVGSVGElement> {
	rarity: Rarity
}

const BackgroundPattern: FC<BackgroundPatternProps> = ({ rarity, className, ...props }) => {
	switch (rarity) {
		case 'common':
			return (
				<Common className={cn(styles.background, styles.divine, className)} {...props} />
			)

		case 'rare':
			return (

				<Rare className={cn(styles.background, styles.divine, className)} {...props} />

			)

		case 'epic':
			return (
				<Epic className={cn(styles.background, styles.divine, className)} {...props} />
			)

		case 'mythic':
			return (
				<Mythic className={cn(styles.background, styles.divine, className)} {...props} />
			)

		case 'legendary':
			return (
				<Legendary className={cn(styles.background, styles.divine, className)} {...props} />
			)

		case 'divine':
			return (
				<Divine className={cn(styles.background, styles.divine, className)} {...props} />
			)

		case 'tickets':
			return (
				<Tickets className={cn(styles.background, styles.divine, className)} {...props} />
			)

		case 'ton':
			return (
				<Ton className={cn(styles.background, styles.ton, className)} {...props} />
			)

		default:
			return (
				<Common className={cn(styles.background, styles.divine, className)} {...props} />
			)
	}
}

export default memo(BackgroundPattern)
