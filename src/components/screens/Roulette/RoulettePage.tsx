import Roulette from '@/screens/Home/Case/Roulette/Roulette'
import type { RootState } from '@/store/store'
import styles from './RoulettePage.module.scss'

import { shallowEqual, useSelector } from 'react-redux'
import { Navigate, useNavigate } from 'react-router'
import useOpenCase from '@/hooks/useOpenCase'
import IconTap from '@/assets/icons/iconTap.svg?react'
import useTranslation from '@/hooks/useTranslation'
import { PrizeTypeEnum } from '@/store/api/content.api'

function RoulettePage() {
	const currentCrystal = useSelector(
		(state: RootState) => state.crystals.currentCrystal,
		shallowEqual,
	)

	const { caseItem } = useOpenCase()

	const navigate = useNavigate()

	const { t } = useTranslation()

	if (!currentCrystal) {
		return <Navigate to="/" />
	}

	const handleSkip = () => {
		if (caseItem?.type === PrizeTypeEnum.GIFT) {
			navigate(`/${caseItem?.id}`)
		}
		else if (caseItem?.type === PrizeTypeEnum.DUST) {
			navigate(`/${caseItem?.id}`)
		}
		else if (caseItem?.type === PrizeTypeEnum.PROMOCODE) {
			navigate(`/promo`)
		}
	}

	return (
		<div onClick={handleSkip} className={styles.container}>
			<Roulette isOpenRoulette />
			<div className={styles.skipContainer}>
				<IconTap width={45} height={45} />
				{t('skip')}
			</div>
		</div>
	)
}

export default RoulettePage
