import React from 'react'
import styles from './Stats.module.scss'

import friends from '@/assets/icons/friends.svg'
import gem from '@/assets/icons/gemWhite.svg'
import tonIcon from '@/assets/icons/iconTonWhite.svg'
import useTranslation from '@/hooks/useTranslation'
import { openModal } from '@/store/modal/modalSlice'
import { useDispatch } from 'react-redux'
import IconQuestion from '@/assets/icons/questionmark.svg?react'
import type { ReferralInfoResponse } from '@/store/api/profile.api'

interface StatsBlockProps {
	referralInfo: ReferralInfoResponse | undefined
}

export const StatsBlock: React.FC<StatsBlockProps> = ({ referralInfo }) => {
	const { t } = useTranslation()
	const dispatch = useDispatch()

	const stats = [
		{
			label: 'stats.blocked_balance',
			value: referralInfo?.locked_balance ?? 0,
			icon: tonIcon,
		},
		{
			label: 'stats.commissions_earned',
			value: referralInfo?.all_time_profit ?? 0,
			icon: tonIcon,
		},
		{
			label: 'stats.friends_invited',
			value: referralInfo?.referral_count ?? 0,
			icon: friends,
		},
		{
			label: 'stats.opened_crystals',
			value: referralInfo?.cases_opened ?? 0,
			icon: gem,
		},
	]

	return (
		<div className={styles.container}>
			{stats.map((stat, index) => (
				<div key={stat.label} className={styles.row}>
					<div className={styles.labelBlock}>
						<span className={styles.label}>{t(`earn.referrals.balance.${stat.label}`)}</span>
						{index === 0 && <IconQuestion width={16} height={16} onClick={() => dispatch(openModal())} />}
					</div>
					<div className={styles.valueBlock}>
						<span className={styles.value}>{stat.value}</span>
						<img className={styles.icon} src={stat.icon} alt={`${stat.label} icon`} />
					</div>
				</div>
			))}
		</div>
	)
}
