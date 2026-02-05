import type { FC } from 'react'
import Button from '@/ui/Button/Button.tsx'
import cn from 'classnames'
import styles from './InfoModal.module.scss'
import useTranslation from '@/hooks/useTranslation'
import IconQuestion from '@/assets/icons/questionIcon.svg?react'
import { useDispatch } from 'react-redux'
import { closeModal } from '@/store/modal/modalSlice'

interface InfoModalProps {
	title: string
	text?: string
}

const InfoModal: FC<InfoModalProps> = ({ title, text }) => {
	const { t } = useTranslation()

	const dispatch = useDispatch()

	return (
		<div className={styles.modal}>
			<div className={styles.img}>
				<IconQuestion width={70} height={70} />
			</div>

			<div className={styles.head}>
				<h1 className={cn(styles.title, styles.confirmation)}>{title}</h1>
				{text && (
					<p className={styles.text}>{text}</p>
				)}
			</div>

			<div className={styles.body}>
				<Button className={styles.button} onClick={() => dispatch(closeModal())}>
					<span>{t('info.close')}</span>
				</Button>
			</div>

		</div>
	)
}

export default InfoModal
