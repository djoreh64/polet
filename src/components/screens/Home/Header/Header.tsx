import type { FC } from 'react'

import useOpenCase from '@/hooks/useOpenCase.ts'

import UiHeader from '@/ui/Header/Header.tsx'

import { motion } from 'motion/react'

import styles from './Header.module.scss'

const wrapperVariants = {
	initial: { opacity: 1, y: 0 },
	animate: {
		opacity: 0,
		y: -40,
		transition: {
			duration: 0.6,
			ease: 'easeInOut',
			delay: 0.6,
		},
	},
}

const Header: FC = () => {
	const { isOpening } = useOpenCase()

	return (
		<motion.div className={styles.header} initial="initial" animate={isOpening && 'animate'} variants={wrapperVariants}>
			<UiHeader />
		</motion.div>
	)
}

export default Header
