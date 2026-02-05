import type { FC } from 'react'

import Head from '@/screens/Earn/Tasks/Head/Head.tsx'
import List from '@/screens/Earn/Tasks/List/List.tsx'

import { motion } from 'motion/react'

const variants = {
	initial: { opacity: 0 },
	enter: { opacity: 1 },
}

const transition = {
	duration: 0.4,
	ease: 'easeInOut',
}

const Tasks: FC = () => {
	return (
		<motion.div style={{ overflow: 'scroll', height: '85vh' }} initial="initial" animate="enter" exit="initial" variants={variants} transition={transition}>
			<Head />
			<List />
		</motion.div>
	)
}

export default Tasks
