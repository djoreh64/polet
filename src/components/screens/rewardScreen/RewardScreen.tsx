import type { FC } from 'react'
import { useEffect } from 'react'
import styles from './rewardscreen.module.scss'
import useTranslation from '@/hooks/useTranslation.ts'
import Card from '@/screens/Gift/Card/Card.tsx'
import useOpenCase from '@/hooks/useOpenCase.ts'
import { Navigate, useNavigate } from 'react-router'
import Actions from '@/screens/Gift/Actions/Actions.tsx'
import { salePrice } from '@/utils/utils.ts'
import Button from '@/ui/Button/Button'

export const RewardScreen: FC = () => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const { caseItem, isOpening, setCase } = useOpenCase()

	useEffect(() => {
		if (caseItem && isOpening) {
			setCase(caseItem)
		}
	}, [caseItem, isOpening, setCase])

	if (caseItem === null) {
		return <Navigate to="/" />
	}

	const rays = Array.from({ length: 13 })

	return (
		<div className={styles.wrapper}>

			<div className={styles.title}>
				{t('collection.actions.card.you_win')}
				!
			</div>

			<div className={styles.cardwrapper}>
				<div className={styles.rays}>
					{rays.map((_, i) => (
						// eslint-disable-next-line react/no-array-index-key
						<div key={i} className={styles.ray} style={{ ['--i' as any]: i }} />
					))}
				</div>

				<Card
					rarity={caseItem?.rarity}
					gift={caseItem?.type ?? ''}
					model={caseItem?.model as string}
					slug={caseItem?.slug ?? ''}
					margin="0"
				/>

				<div className={styles.cardwrapper__title}>
					<div className={styles.cardwrapper__title__value}>{caseItem?.type as string}</div>
					<div className={styles.cardwrapper__title__type} style={{ color: `var(--color-rarity-${caseItem?.rarity.toLowerCase()})`, border: `2px solid var(--color-rarity-${caseItem?.rarity.toLowerCase()}-40)` }}>{caseItem?.rarity}</div>
				</div>
				<div className={styles.cardwrapper__desc}>{caseItem?.model as string}</div>
			</div>
			{caseItem.status !== ''
				? <Actions sellPrice={salePrice(caseItem.floor_price ?? 0)} customstyle={styles.customfooter} />
				: (
						<Button className={styles.footer__item} onClick={() => navigate('/')}>{t('donate.back')}</Button>
					)}
		</div>
	)
}
