import type { FC } from 'react'
import Button from '@/ui/Button/Button.tsx'
import Icon from '@/ui/Icon/Icon.tsx'
import cn from 'classnames'
import styles from './ConfirmModal.module.scss'
import useTranslation from '@/hooks/useTranslation'
import IconTon from '@/assets/icons/iconTon.svg?react'
import IconQuestion from '@/assets/icons/questionIcon.svg?react'

interface ConfirmModalProps {
	title: string
	text?: string
	fee?: number
	onConfirm?: () => void
	onClose: () => void
	confirmButtons?: {
		title: string
		fee?: number
		onConfirm: () => void
	}[]
}

const ConfirmModal: FC<ConfirmModalProps> = ({ title, text, fee, onConfirm, onClose, confirmButtons }) => {
	const { t } = useTranslation()

	return (
		<>
			<div className={styles.head}>
				<div className={styles.img}>
					<IconQuestion width={70} height={70} />
					<img className={styles.stars} src="/img/stars-fx.png" />
				</div>
				<h1 className={cn(styles.title, styles.confirmation)}>{title}</h1>
				{text && (
					<p className={styles.text}>{text}</p>
				)}
			</div>

			<div className={styles.body}>
				{confirmButtons && confirmButtons.length > 0
					? (
							<div className={styles.buttonsRow}>
								{confirmButtons.map(button => (
									<Button key={button.title} className={cn(styles.button, styles.confirm)} onClick={button.onConfirm}>
										<span>{button.title}</span>
										{button.fee !== undefined && button.fee > 0 && (
											<div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
												<span>{button.fee}</span>
												<IconTon width={16} height={16} />
											</div>
										)}
									</Button>
								))}
							</div>
						)
					: (
							<Button className={cn(styles.button, styles.confirm)} onClick={onConfirm}>
								<Icon name="confirm" width={20} height={20} />
								<span>{t('confirmation.confirm')}</span>
								{fee !== undefined && fee > 0 && (
									<div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
										<span>{fee}</span>
										<IconTon width={16} height={16} />
									</div>
								)}
							</Button>
						)}
				<Button className={styles.button} onClick={onClose}>
					<Icon name="cancel" width={20} height={20} />
					<span>{t('confirmation.cancel')}</span>
				</Button>
			</div>

		</>
	)
}

export default ConfirmModal
