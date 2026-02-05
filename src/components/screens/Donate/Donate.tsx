import type { FC } from 'react'

import Back from '@/screens/Donate/Back/Back.tsx'
import Header from '@/screens/Donate/Header/Header.tsx'
import { motion } from 'motion/react'
import DepositModal from './Modal/DepositModal'

const variants = {
	initial: { opacity: 0 },
	enter: { opacity: 1 },
}

const transition = {
	duration: 0.4,
	ease: 'easeInOut',
}

const Donate: FC = () => {
	return (
		<motion.div style={{ overflow: 'scroll', height: '85vh' }} initial="initial" animate="enter" exit="initial" variants={variants} transition={transition}>
			<Header />
			<DepositModal />
			<Back />
		</motion.div>
	)
}

export default Donate
