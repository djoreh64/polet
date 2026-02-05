import type { FC } from 'react'
import { useSelector } from 'react-redux'

import Balance from '@/screens/Earn/Referrals/Balance/Balance.tsx'
import Head from '@/screens/Earn/Referrals/Head/Head.tsx'
import Invite from '@/screens/Earn/Referrals/Invite/Invite.tsx'

import { motion } from 'motion/react'

import Friends from '@/screens/Earn/Referrals/Friends/Friends'
import styles from './Referrals.module.scss'
import Modal from '@/ui/Modal/Modal'
import InfoModal from '@/ui/Modal/InfoModal/InfoModal'
import useTranslation from '@/hooks/useTranslation'
import type { RootState } from '@/store/store'

const variants = {
	initial: { opacity: 0 },
	enter: { opacity: 1 },
}

const transition = {
	duration: 0.4,
	ease: 'easeInOut',
}

const Referrals: FC = () => {
	const { t } = useTranslation()
	const modalContent = useSelector((state: RootState) => state.modal.content)

	const isWithdrawSubmitted = modalContent === 'referralWithdrawSubmitted'

	return (
		<motion.div className={styles.container} initial="initial" animate="enter" exit="initial" variants={variants} transition={transition}>
			<Head />
			<Invite />
			<Balance />
			<Friends />

			<Modal type="info">
				<InfoModal
					title={isWithdrawSubmitted ? t('earn.referrals.withdraw.submitted.title') : t('info.blockedBalance.title')}
					text={isWithdrawSubmitted ? t('earn.referrals.withdraw.submitted.text') : t('info.blockedBalance.text')}
				/>
			</Modal>
		</motion.div>
	)
}

export default Referrals
