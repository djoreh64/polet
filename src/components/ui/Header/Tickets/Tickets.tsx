import type { FC } from 'react'
import Coin from '@/assets/icons/iconTon.svg?react'
import BackgroundPattern from '@/ui/BackgroundPattern/BackgroundPattern.tsx'
import styles from './Tickets.module.scss'
import { Link } from 'react-router'
import PepeIcon from '@/assets/icons/pepe-icon.svg?react'
import PepeIconViolet from '@/assets/icons/pepe-icon-viol.svg?react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'

interface TicketsProps {
	amount: number | any
	isTon?: boolean
}

const Tickets: FC<TicketsProps> = ({ amount, isTon = false }) => {
	const isPepeAvailable = useSelector((state: RootState) => state.ui.isPepeAvailable)

	const Component = isTon ? 'div' : Link
	return (
		<Component to="/free-cases" className={`${styles.tickets} ${isPepeAvailable && !isTon ? styles.border : ''}`}>
			<div className={styles.content}>
				{isTon
					? <Coin width={20} height={20} className={styles.icon} />
					: isPepeAvailable
						? <PepeIconViolet width={20} height={20} className={styles.icon} />
						: <PepeIcon width={20} height={20} className={styles.icon} />}
				<div className={styles.value}>{amount}</div>
			</div>
			<BackgroundPattern rarity="tickets" />
		</Component>
	)
}

export default Tickets
