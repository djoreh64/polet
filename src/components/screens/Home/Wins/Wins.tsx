import type { FC } from 'react'
import { useCallback, useEffect } from 'react'

import type { PrizeModel } from '@/api/content.api.ts'
import { useGetLatestWinsQuery } from '@/api/content.api.ts'
import useOpenCase from '@/hooks/useOpenCase.ts'
import useTranslation from '@/hooks/useTranslation.ts'

import { useNavigate } from 'react-router'

import WinsCard from '@/screens/Home/Wins/WinsCard/WinsCard.tsx'
import Container from '@/ui/Container/Container.tsx'

import { motion } from 'motion/react'

import type { RootState } from '@/store/store'
import { useSelector } from 'react-redux'
import styles from './Wins.module.scss'
import useEmblaCarousel from 'embla-carousel-react'

const wrapperVariants = {
	initial: { opacity: 1, y: 0 },
	animate: {
		opacity: 0,
		y: -180,
		transition: {
			duration: 0.6,
			ease: 'easeInOut',
			delay: 0.7,
		},
	},
}
const variants = {
	initial: { opacity: 0 },
	enter: { opacity: 1 },
}

const transition = {
	duration: 0.4,
	ease: 'easeIn',
	delay: 0.3,
}

const Wins: FC = () => {
	const { isOpening, setCase } = useOpenCase()
	const isFirstOpen = useSelector((state: RootState) => state.ui.firstOpen)
	const navigate = useNavigate()

	const { t } = useTranslation()

	const { data: winsData, isSuccess: isWinsSuccess, refetch: refetchWins } = useGetLatestWinsQuery()

	const [emblaRef] = useEmblaCarousel({
		align: 'start',
		containScroll: 'trimSnaps',
		dragFree: true,
	})

	const renderCard = useCallback((item: any, index: number) => (
		<div className={styles.slide} key={`${item?.gift?.id + item?.gift?.model + item?.user_name + item + index}`}>
			<WinsCard
				gift={item.reward}
				user={{
					username: item?.user?.first_name,
					avatar: item?.user?.pfp_url,
				}}
				onClick={() => {
					setCase(item.reward)
					navigate(`/${item.reward.id}`)
				}}
			/>
		</div>
	), [navigate, setCase])

	useEffect(() => {
		refetchWins()
	}, [refetchWins])

	return (
		<motion.section className={styles.wins} initial="initial" animate={isOpening && 'animate'} variants={wrapperVariants}>
			<Container>
				<motion.div
					initial={isFirstOpen ? 'initial' : false}
					animate={isFirstOpen ? 'enter' : false}
					exit={isFirstOpen ? 'initial' : undefined}
					variants={variants}
					transition={transition}
				>
					<h2 className={styles.title}>{t('home.wins.title')}</h2>
					<div className={styles.list} ref={emblaRef}>
						<div className={styles.container}>
							{isWinsSuccess && winsData?.map((item, index) => renderCard(item, index))}
						</div>
					</div>
				</motion.div>
			</Container>
		</motion.section>
	)
}

export default Wins
