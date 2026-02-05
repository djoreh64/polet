import Button from '@/ui/Button/Button'
import styles from './PromoCode.module.scss'
import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import Container from '../Container/Container'
import useTranslation from '@/hooks/useTranslation'
import { motion } from 'motion/react'
import { useActivateFromInventoryMutation } from '@/store/api/promocode.api'
import useTelegram from '@/hooks/useTelegram'

interface PromoCodeProps {
	code: string
	isCollection: boolean
	fromActivity: boolean
}

const variants = {
	initial: { opacity: 0 },
	enter: { opacity: 1 },
}

const transition = {
	duration: 0.4,
	ease: 'easeInOut',
}

export default function PromoCode({ isCollection, fromActivity, code }: PromoCodeProps) {
	const navigate = useNavigate()
	const { t } = useTranslation()
	const [activatePromocode] = useActivateFromInventoryMutation()
	const webApp = useTelegram()

	const handleCollectButton = useCallback(() => {
		navigate('/')
	}, [navigate])

	const handleActivateButton = useCallback(async () => {
		const result = await activatePromocode({ id: code })
		if (result.data?.success) {
			webApp.webApp.HapticFeedback.notificationOccurred('success')
			navigate(fromActivity ? '/collection?tab=activity' : '/collection')
		}
		else {
			const errorMessage = result.error?.data?.message
			webApp.webApp.HapticFeedback.notificationOccurred('error')
			webApp.webApp.showPopup({
				title: 'Error',
				message: errorMessage,
			})
		}
	}, [activatePromocode, code, fromActivity, navigate, webApp.webApp])

	return (
		<motion.section
			className={styles.actions}
			initial="initial"
			animate="enter"
			variants={variants}
			transition={transition}
		>
			<Container className={styles.container}>
				<>
					<Button className={styles.button} onClick={() => navigate(fromActivity ? '/collection?tab=activity' : '/collection')}>
						<span>{t('donate.back')}</span>
					</Button>
					{!isCollection
						? (
								<Button className={styles.button} onClick={handleActivateButton} primary>
									{t('gift.actions.activate')}
								</Button>
							)
						: (
								<Button className={styles.button} onClick={handleCollectButton} primary>
									{t('gift.actions.collect')}
								</Button>
							)}
				</>
			</Container>
		</motion.section>
	)
}
