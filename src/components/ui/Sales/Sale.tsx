import useTranslation from '@/hooks/useTranslation'
import type { FC } from 'react'
import styles from './sale.module.scss'

export const Sale: FC<{ sale: number }> = ({ sale }) => {
	const { t } = useTranslation()

	return (
		<div className={styles.sale_container}>
			<div className={styles.sub_sale_container}>
				<span>
					+
					{sale}
					%
				</span>
				<p className={styles.text}>
					{' '}
					{t('sale.free')}
				</p>
			</div>
		</div>
	)
}
