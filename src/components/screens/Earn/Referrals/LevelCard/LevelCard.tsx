import IconCashFlow from '@/assets/icons/cashflow.svg?react'
import IconLock from '@/assets/icons/lock.svg?react'
import { ProgressBar } from '@/screens/Earn/Referrals/LevelCard/ProgressBar/ProgressBar'
import styles from './LevelCard.module.scss'

import decor2 from '@/assets/decor/decor-blue.svg'
import decor6 from '@/assets/decor/decor-gold.svg'
import decor1 from '@/assets/decor/decor-gray.svg'
import decor3 from '@/assets/decor/decor-pink.svg'
import decor4 from '@/assets/decor/decor-red.svg'
import decor5 from '@/assets/decor/decor-violet.svg'

import useTranslation from '@/hooks/useTranslation'
import { useGetReferralInfoQuery } from '@/store/api/profile.api'
import type { FC } from 'react'

const levelDecorMap: Record<number, string> = {
	1: decor1,
	2: decor2,
	3: decor3,
	4: decor4,
	5: decor5,
	6: decor6,
}

const levelColorMap: Record<number, string> = {
	1: 'gray',
	2: 'blue',
	3: 'pink',
	4: 'red',
	5: 'violet',
	6: 'gold',
}
const levelNames: Record<string, number> = {
	Start: 1,
	Junior: 2,
	Middle: 3,
	Sineor: 4,
	VIP: 5,
	Premium: 6,
}

interface Props {
	id: number
	name: string
	targetReferrals: number
	targetVolume: number
	minReferrals: number
	minVolume: number
	percentage: number
	isExclusive?: boolean
}

const LevelCard: FC<Props> = ({ id, name, targetReferrals, targetVolume, minReferrals, minVolume, percentage, isExclusive = false }) => {
	const level = levelNames[name] || 1
	const decor = levelDecorMap[level] || decor1
	const color = levelColorMap[level] || null
	const colorClass = styles[`icon--${color}`]

	const { data: referralData } = useGetReferralInfoQuery()

	const isActive = id === referralData?.referral_level.id

	const { t } = useTranslation()

	return (
		<div className={styles.card}>
			<div className={styles.level}>
				<span>
					{t('earn.referrals.invite.level')}
					{' '}
					{level}
				</span>
				{!isActive && <IconLock /> }
			</div>

			<div className={styles.info}>
				<IconCashFlow className={`${styles.icon} ${colorClass}`} />
				<span>
					{t('earn.referrals.invite.percent.text.start')}
				</span>
				<span className={styles.rate}>
					{percentage}
					%
				</span>
				<span>{t('earn.referrals.invite.percent.text.end')}</span>
			</div>

			<ProgressBar level={level} label="volume" value={referralData?.referral_total_deposit || 0} min={minVolume} max={targetVolume} color={color} />
			<ProgressBar level={level} label="referrals" value={referralData?.referral_count || 0} min={minReferrals} max={targetReferrals} color={color} />

			{isExclusive && (
				<div className={`${styles.badge} ${styles[`badge--${color}`]}`}>
					<span>
						{t('earn.referrals.invite.exclusive')}
					</span>
				</div>
			)}

			<img src={decor} alt="decor" className={styles.decor} />
		</div>
	)
}

export default LevelCard
