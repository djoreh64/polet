import React from 'react'
import styles from './ProgressBar.module.scss'
import PepeIcon from '@/assets/icons/pepe-icon.svg?react'

interface ProgressBarProps {
	value: number // текущее значение
	max: number // максимум
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max }) => {
	const percentage = Math.min(100, Math.max(0, (value / max) * 100))

	return (
		<div className={styles.wrapper}>
			<div className={styles.bar}>
				<div
					className={styles.fill}
					style={{ width: `${percentage}%` }}
				/>
			</div>
			<div className={styles.bottom}>
				<span className={styles.start}>0</span>
				<PepeIcon width={20} height={20} className={styles.icon} />
				<span className={styles.end}>{max}</span>
			</div>
		</div>
	)
}
