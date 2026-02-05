import IconTon from '@/assets/icons/iconTonWhite.svg?react'
import IconReferrals from '@/assets/icons/friends.svg?react'
import useTranslation from '@/hooks/useTranslation'
import React from 'react'
import styles from './ProgressBar.module.scss'
import { formatNumber } from '@/utils/utils'

interface ProgressBarProps {
	value: number
	max: number
	min: number
	color: string | null
	label: 'volume' | 'referrals'
	level: number
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, min, color, label, level }) => {
	const percentage = max > min ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0
	const colorClass = styles[`fill--${color}`]
	const isGreater = level > 4

	const { t } = useTranslation()

	return (
		<div className={styles.volumeBar}>
			<div className={styles.track}>
				<div className={`${styles.fill} ${colorClass}`} style={{ width: `${isGreater ? '100' : percentage}%` }} />
			</div>
			<div className={styles.labels}>
				<span className={styles.min}>{isGreater ? '0' : min}</span>
				<span className={styles.center}>
					{t(`earn.referrals.invite.${label}`)}
					{' '}
					{formatNumber(value)}
					{' '}
					<span className={styles.icon}>
						{label === 'volume'
							? <IconTon width={14} height={14} />
							: <IconReferrals width={12} height={12} />}
					</span>
				</span>
				<span className={styles.max}>{isGreater ? '∞' : max}</span>
			</div>
		</div>
	)
}
