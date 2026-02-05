import type { FC } from 'react'

import useTranslation from '@/hooks/useTranslation.ts'

import Actions from '@/screens/Collection/Actions/Actions.tsx'
import Profile from '@/screens/Collection/Profile/Profile.tsx'
import Storage from '@/screens/Collection/Storage/Storage.tsx'
import Tabs from '@/ui/Tabs/Tabs.tsx'

import { motion } from 'motion/react'
import { useLocation, useNavigate } from 'react-router'
import { useEffect } from 'react'

const variants = {
	initial: { opacity: 0 },
	enter: { opacity: 1 },
}

const transition = {
	duration: 0.4,
	ease: 'easeInOut',
}

const Collection: FC = () => {
	const { t } = useTranslation()

	const location = useLocation()
	const navigate = useNavigate()
	const searchParams = new URLSearchParams(location.search)
	const tab = searchParams.get('tab')
	const isActivity = tab === 'activity'

	useEffect(() => {
		const params = new URLSearchParams(location.search)
		if (params.has('tab')) {
			params.delete('tab')

			navigate(
				{
					pathname: location.pathname,
					search: params.toString() ? `?${params.toString()}` : '',
				},
				{ replace: true },
			)
		}
	}, [location.pathname, location.search, navigate])

	const tabs = [
		{
			id: 'storage',
			label: t('collection.storage.tab'),
			content: <Storage />,
		},
		{
			id: 'actions',
			label: t('collection.actions.tab'),
			content: <Actions />,
		},
	]

	return (
		<motion.div initial="initial" style={{ height: '100vh', overflow: 'scroll' }} animate="enter" exit="initial" variants={variants} transition={transition}>
			<Profile />
			<Tabs tabs={tabs} defaultTab={isActivity ? 'actions' : 'storage'} />
		</motion.div>
	)
}

export default Collection
