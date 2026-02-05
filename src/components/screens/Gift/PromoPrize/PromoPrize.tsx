import type { FC } from 'react'

import useTranslation from '@/hooks/useTranslation'
import styles from './PromoPrize.module.scss'
import promo from '@/assets/promo.png'
import { PrizeTypeEnum } from '@/store/api/content.api'
import useOpenCase from '@/hooks/useOpenCase'

const EmptyGift: FC<{ fromActivity: boolean }> = () => {
	const { caseItem } = useOpenCase()

	const { t } = useTranslation()

	if (caseItem && caseItem.type === PrizeTypeEnum.PROMOCODE) {
		const currentPromo = caseItem.promocode || null
		return (
			<div className={styles.container}>
				<div className={styles.imageContainer}>
					<div className={styles.imageCard}>
						<img className={styles.img} src={promo} alt="tickets" />
					</div>
					<img className={styles.blur} src="/img/ellipse-blur.svg" alt="" />
					<img className={styles.stars} src="/img/stars-fx.png" />
				</div>
				<h3 className={styles.title}>
					{t('promoGift.header1')}
					{' '}
					<span>
						{currentPromo?.deposit_bonus}
						%
					</span>
					{' '}
					{t('promoGift.header2')}
				</h3>

				<div className={styles.promoCodeContainer}>
					<p className={styles.expiresAt}>
						{t('promoGift.expires_at')}
					</p>

				</div>
			</div>
		)
	}
	return null
}

export default EmptyGift
