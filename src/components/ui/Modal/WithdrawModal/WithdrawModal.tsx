import type { FC } from 'react'
import Button from '@/ui/Button/Button.tsx'
import cn from 'classnames'
import styles from './WithdrawModal.module.scss'
import useTranslation from '@/hooks/useTranslation'
import IconQuestion from '@/assets/icons/questionIcon.svg?react'
import IconTon from '@/assets/icons/iconTon.svg?react'
import Icon from '@/ui/Icon/Icon'

interface WithdrawModalProps {
	isDirect: boolean
	title?: string
	text?: string
	fees: {
		telegram: number
		portals: number
	}
	onSelect: (destination: 'telegram' | 'portals') => void
	onClose: () => void
}

const WithdrawModal: FC<WithdrawModalProps> = ({ isDirect, fees, onSelect, onClose, title, text }) => {
	const { t } = useTranslation()

	return (
		<>
			<div className={styles.head}>
				<div className={styles.img}>
					<IconQuestion width={70} height={70} />
					<img className={styles.stars} src="/img/stars-fx.png" alt="stars" />
				</div>
				<h1 className={styles.title}>
					{title || t('gift.modal.title')}
				</h1>
				<p className={styles.text}>
					{text || (isDirect
						? t('gift.modal.direct_text')
						: t('gift.modal.template_text'))}
				</p>
			</div>

			<div className={styles.body}>
				<div className={styles.buttonsRow}>
					<Button
						className={cn(styles.button, styles.confirm)}
						onClick={() => onSelect('telegram')}
					>
						<div className={styles.buttonContent}>
							<span>Telegram</span>
						</div>
						<div className={styles.fee}>
							{fees.telegram === 0 ? (
								<span className={styles.free}>FREE</span>
							) : (
								<>
									<span>{fees.telegram}</span>
									<IconTon width={16} height={16} />
								</>
							)}
						</div>
					</Button>

					<Button
						className={cn(styles.button, styles.confirm)}
						disabled={isDirect}
						onClick={() => !isDirect && onSelect('portals')}
						style={isDirect ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
					>
						<div className={styles.buttonContent}>
							<span>Portals</span>
						</div>
						<div className={styles.fee}>
							{fees.portals === 0 ? (
								<span className={styles.free}>FREE</span>
							) : (
								<>
									<span>{fees.portals}</span>
									<IconTon width={16} height={16} />
								</>
							)}
						</div>
					</Button>
				</div>

				<Button className={styles.cancelButton} onClick={onClose}>
					<Icon name="cancel" width={20} height={20} />
					<span>{t('confirmation.cancel')}</span>
				</Button>
			</div>
		</>
	)
}

export default WithdrawModal
