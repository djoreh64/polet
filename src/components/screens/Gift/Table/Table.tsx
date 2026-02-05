import type { FC } from 'react'

import useTranslation from '@/hooks/useTranslation.ts'

import Container from '@/ui/Container/Container.tsx'

import styles from './Table.module.scss'

interface TableProps {
	model?: {
		text: string
		rarity?: number
	}
	backdrop?: {
		text: string
		rarity?: number
	}
	symbol?: {
		text: string
		rarity?: number
	}
}

const Table: FC<TableProps> = ({ model, backdrop, symbol }) => {
	const { t } = useTranslation()

	return (
		<section className={styles.table}>
			<Container>
				<div className={styles.body}>
					<div className={styles.row}>
						<div className={styles.label}>{t('gift.table.model')}</div>
						<div className={styles.value}>
							{model?.text || 'Floor'}
							{model?.rarity && (
								<span>
									{model.rarity}
									%
								</span>
							)}
						</div>
					</div>
					<div className={styles.row}>
						<div className={styles.label}>{t('gift.table.backdrop')}</div>
						<div className={styles.value}>
							{backdrop?.text || 'Random'}
							{backdrop?.rarity && (
								<span>
									{backdrop.rarity}
									%
								</span>
							)}
						</div>
					</div>
					<div className={styles.row}>
						<div className={styles.label}>{t('gift.table.symbol')}</div>
						<div className={styles.value}>
							{symbol?.text ?? 'Random'}
							{symbol?.rarity && (
								<span>
									{symbol.rarity}
									%
								</span>
							)}
						</div>
					</div>
				</div>
			</Container>
		</section>
	)
}

export default Table
