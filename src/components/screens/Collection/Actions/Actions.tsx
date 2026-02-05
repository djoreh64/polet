import type { FC } from 'react'
import { useEffect, useRef, useState } from 'react'

import { useGetSpinsQuery } from '@/api/profile.api.ts'
import useTranslation from '@/hooks/useTranslation.ts'

import Item from '@/screens/Collection/Actions/Item/Item.tsx'

import { motion } from 'motion/react'

import styles from './Actions.module.scss'

const variants = {
	initial: { opacity: 0 },
	enter: { opacity: 1 },
}

const transition = {
	duration: 0.4,
	ease: 'easeInOut',
}

const Actions: FC = () => {
	const { t } = useTranslation()

	const [page, setPage] = useState(1)

	const {
		data: actionsData,
		isSuccess: isActionsSuccess,
		isFetching: isActionsFetching,
	} = useGetSpinsQuery({ page, demo: false, size: 50 })

	const observerRef = useRef<IntersectionObserver | null>(null)
	const sentinelRef = useRef<HTMLDivElement | null>(null)

	const hasMore = !!actionsData
		&& typeof actionsData.page === 'number'
		&& typeof actionsData.size === 'number'
		&& actionsData.page * actionsData.size < actionsData.total

	useEffect(() => {
		const node = sentinelRef.current
		if (!node) {
			return
		}

		if (observerRef.current) {
			observerRef.current.disconnect()
		}

		observerRef.current = new IntersectionObserver((entries) => {
			const [entry] = entries

			if (entry.isIntersecting && hasMore && !isActionsFetching) {
				setPage(prevPage => prevPage + 1)
			}
		})

		observerRef.current.observe(node)

		return () => {
			observerRef.current?.disconnect()
		}
	}, [hasMore, isActionsFetching])

	const filteredItems = actionsData?.items?.filter(item => item.type === 'won_prize') ?? []

	return (
		<motion.div
			className={styles.actions}
			initial="initial"
			animate="enter"
			variants={variants}
			transition={transition}
		>
			<h1 className={styles.title}>{t('collection.actions.title')}</h1>
			<div className={styles.body}>
				{isActionsSuccess
					&& filteredItems.map(item => (
						<Item
							action="won_prize"
							spinItem={item}
							date={new Date(item?.date).toLocaleDateString()}
							key={item.date + item.name}
						/>
					))}
				<div ref={sentinelRef} />
			</div>
		</motion.div>
	)
}

export default Actions
