import type { FC } from 'react'

import useTranslation from '@/hooks/useTranslation.ts'

import Referrals from '@/screens/Earn/Referrals/Referrals.tsx'
import Tasks from '@/screens/Earn/Tasks/Tasks.tsx'
import Tabs from '@/ui/Tabs/Tabs.tsx'

import { motion } from 'motion/react'

import styles from './Earn.module.scss'

const variants = {
	initial: { opacity: 0 },
	enter: { opacity: 1 },
}

const transition = {
	duration: 0.4,
	ease: 'easeInOut',
}

const Earn: FC = () => {
	const { t } = useTranslation()

	const tabs = [
		{
			id: 'tasks',
			label: t('earn.tasks.tab'),
			content: <Tasks />,
		},
		{
			id: 'referrals',
			label: t('earn.referrals.tab'),
			content: <Referrals />,
		},
	]

	return (
		<motion.div initial="initial" animate="enter" exit="initial" variants={variants} transition={transition}>
			<Tabs className={styles.tabs} tabs={tabs} />
		</motion.div>
	)
}

export default Earn
