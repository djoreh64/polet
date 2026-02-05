import type { FC } from 'react'

import Container from '@/ui/Container/Container.tsx'
import Link from '@/ui/Navbar/Link/Link.tsx'

import { motion } from 'motion/react'

import styles from './Navbar.module.scss'

const wrapperVariants = {
	initial: { opacity: 1, y: 0 },
	animate: {
		opacity: 0,
		y: 80,
		transition: {
			duration: 0.6,
			ease: 'easeInOut',
			delay: 0.8,
		},
	},
	exit: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.6,
			ease: 'easeInOut',
		},
	},
}

const Navbar: FC = () => {
	return (
		<motion.nav
			className={styles.navbar}
			data-navbar
			initial="initial"
			animate="exit"
			exit="exit"
			variants={wrapperVariants}
		>
			<Container className={styles.container}>
				<div className={styles.nav}>
					<Link icon="magic-wand" to="/plane-game-first-page" />
					<Link icon="home" to="/" />
					<Link icon="collection" to="/collection" />
					<Link icon="earn" to="/earn" />
					<Link icon="leaderboard" to="/leaderboard" />
				</div>
			</Container>
		</motion.nav>
	)
}

export default Navbar
