import type { FC } from 'react'

import Coin from '@/assets/icons/iconTon.svg?react'

import Icon from '@/ui/Icon/Icon.tsx'
import styles from './Balance.module.scss'
import { Link } from 'react-router'

interface BalanceProps {
	amount: number | undefined
	depositButton?: boolean
}

const Balance: FC<BalanceProps> = ({ amount, depositButton = false }) => {
	return (
		<Link
			className={styles.balance}
			to="/deposit"
		>
			<Coin className={styles.icon} width={20} height={20} />
			<span className={styles.amount}>{amount ?? 0}</span>
			<div className={styles.deposit} style={{ visibility: depositButton ? 'visible' : 'hidden' }}>
				<Icon name="deposit" width={16} height={16} />
			</div>
		</Link>
	)
}

export default Balance
