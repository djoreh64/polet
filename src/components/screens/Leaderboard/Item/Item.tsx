import type { FC } from 'react'

import IconTon from '@/assets/icons/iconTon.svg?react'
import IconGem from '@/assets/icons/gem.svg?react'

import cn from 'classnames'

import styles from './item.module.scss'

interface ItemProps {
	position: number
	avatar: string
	name: string
	earning: number
	opened: number
}

const Item: FC<ItemProps> = ({ position, avatar, name, earning, opened = 0 }) => {
	return (
		<div className={styles.item}>
			<div className={styles.offer}>
				<div
					className={cn(styles.position, position <= 3 && styles[`position-${position}`])}
				>
					{position > 3 && '#'}
					{position}
				</div>
				<img className={styles.avatar} src={avatar} alt={name} />
				<h3 className={styles.name}>{name}</h3>
			</div>
			<div className={styles.statsWrapper}>
				<div className={styles.caseBadge}>
					<span>{opened}</span>
					<IconGem width={16} height={16} />
				</div>
				<div className={styles.earning}>
					<span>{earning}</span>
					<IconTon width={16} height={16} />
				</div>
			</div>
		</div>
	)
}

export default Item
