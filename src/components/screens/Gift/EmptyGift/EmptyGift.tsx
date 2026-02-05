import type { FC } from 'react'

import Tickets from '@/ui/Header/Tickets/Tickets'
import styles from './EmptyGift.module.scss'
import { getTonImg } from '@/hooks/useGiftModel'
import useOpenCase from '@/hooks/useOpenCase'
import useTranslation from '@/hooks/useTranslation'
import { PrizeTypeEnum } from '@/store/api/content.api'

const EmptyGift: FC = () => {
	const { caseItem } = useOpenCase()

	const { t } = useTranslation()

	if (caseItem && caseItem.type === PrizeTypeEnum.DUST && caseItem.amount) {
		return (
			<div className={styles.container}>
				<div className={styles.imageContainer}>
					<div className={styles.imageCard}>
						<img className={styles.img} src={getTonImg(caseItem.type) || ''} alt="tickets" />
					</div>
					<img className={styles.blur} src="/img/ellipse-blur.svg" alt="" />
					<img className={styles.stars} src="/img/stars-fx.png" />
				</div>
				<h3>
					{`${t('tonGift.header1')} ${caseItem.amount} ${t('tonGift.header2')} `}
				</h3>
				<div className={styles.card}>
					<Tickets amount={caseItem.amount} isTon />

					<p>{t(`tonGift.text${Math.floor(Math.random() * 5) + 1}`)}</p>
				</div>
			</div>
		)
	}
	return null
}

export default EmptyGift
