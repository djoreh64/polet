import type { FC } from 'react'
import { useState } from 'react'

import useTranslation from '@/hooks/useTranslation.ts'

import { useGetTonToUsdQuery } from '@/store/api/tonApi'
import { useWithdrawnReferralMutation } from '@/store/api/wallet.api'
import Button from '@/ui/Button/Button.tsx'

import { StatsBlock } from '@/screens/Earn/Referrals/Balance/Stats'
import Container from '@/ui/Container/Container.tsx'
import Icon from '@/ui/Icon/Icon.tsx'
import styles from './Balance.module.scss'
import { useGetReferralInfoQuery } from '@/store/api/profile.api'
import { useDispatch } from 'react-redux'
import { openModal } from '@/store/modal/modalSlice'

const Balance: FC = () => {
	const [isShowInfo, setIsShowInfo] = useState<boolean>(false)
	const { t } = useTranslation()
	const dispatch = useDispatch()

	const { data: tonToUsd } = useGetTonToUsdQuery()
	const { data: referralInfo } = useGetReferralInfoQuery()

	const usdRate = tonToUsd?.rates?.TON?.prices?.USD ?? 0
	const balance = referralInfo?.balance ?? 0
	const converted = (Number(balance) * usdRate).toFixed(2)

	const [withdrawReferral, { isLoading }] = useWithdrawnReferralMutation()

	const handleClick = async () => {
		const hasEnoughBalance = (Number(balance) >= 10)

		if (!hasEnoughBalance) {
			setIsShowInfo(true)
			return
		}

		setIsShowInfo(false)

		try {
			await withdrawReferral().unwrap()
			dispatch(openModal('referralWithdrawSubmitted'))
		}
		catch {
			// Ошибка уже показана через showTelegramErrorPopup в мутации
		}
	}

	return (
		<section className={styles.balance}>
			<Container>
				<h2 className={styles.title}>{t('earn.referrals.balance.title')}</h2>
				<div className={styles.body}>
					<div className={styles.wrapper}>
						<div className={styles.currency}>
							<div className={styles.top}>
								<Icon name="ton" width={28} height={28} />
								<span>{balance}</span>
							</div>
							<div className={styles.equivalent}>{`≈${converted}$`}</div>
						</div>
						<Button onClick={handleClick} className={styles.button} disabled={isLoading}>
							{t('earn.referrals.balance.button')}
						</Button>
					</div>
					{isShowInfo && <p className={styles.info}>{t('earn.referrals.info')}</p>}
					<hr className={styles.divider} />

					<StatsBlock referralInfo={referralInfo} />

				</div>
			</Container>
		</section>
	)
}

export default Balance
