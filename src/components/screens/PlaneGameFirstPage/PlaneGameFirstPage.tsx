import type { FC } from 'react'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'motion/react'
import StarsIcon from '@/assets/icons/stars.svg?react'
import type { AviamastersWinItem } from '@/store/api/content.api'
import { useGetPlaneGameLatestWinsQuery } from '@/store/api/content.api'
import Button from '@/ui/Button/Button'
import Container from '@/ui/Container/Container'
import useTranslation from '@/hooks/useTranslation'
import WinnerTemplateCard from '@/screens/PlaneGameFirstPage/WinnerTemplateCard/WinnerTemplateCard'
import useEmblaCarousel from 'embla-carousel-react'

import styles from './PlaneGameFirstPage.module.scss'

const variants = {
	initial: { opacity: 0 },
	enter: { opacity: 1 },
}

const transition = {
	duration: 0.4,
	ease: 'easeInOut',
}

function formatWinAmount(value: number): string {
	return value % 1 === 0 ? String(value) : value.toFixed(2)
}

const PlaneGameFirstPage: FC = () => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const { data: winsData, isSuccess: isWinsSuccess, refetch: refetchWins } = useGetPlaneGameLatestWinsQuery()
	const [emblaRef] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps', dragFree: true })
	const videoRef = useRef<HTMLVideoElement>(null)
	const wins = winsData ?? []

	useEffect(() => {
		refetchWins()
	}, [refetchWins])

	useEffect(() => {
		const video = videoRef.current
		if (!video) return
		const onEnded = () => {
			video.currentTime = 0
			video.play()
		}
		video.addEventListener('ended', onEnded)
		return () => video.removeEventListener('ended', onEnded)
	}, [])

	const renderWinCard = (item: AviamastersWinItem, index: number) => (
		<div className={styles['plane-game-first-page__slide']} key={`${item.created_at}-${index}`}>
			<WinnerTemplateCard
				nickname={item.user.first_name}
				amount={formatWinAmount(item.payout_amount)}
				baseAmount={formatWinAmount(item.bet_amount)}
				multiplier={`x${item.multiplier}`}
				avatarUrl={item.user.pfp_url}
			/>
		</div>
	)

	return (
		<motion.div
			className={styles['plane-game-first-page']}
			initial="initial"
			animate="enter"
			exit="initial"
			variants={variants}
			transition={transition}
		>
			<section className={styles['plane-game-first-page__wins']}>
				<Container>
					<h2 className={styles['plane-game-first-page__wins-title']}>{t('planeGameFirstPage.wins.title')}</h2>
					<div className={styles['plane-game-first-page__wins-list']} ref={emblaRef}>
						<div className={styles['plane-game-first-page__wins-container']}>
							{isWinsSuccess && wins.map((item, index) => renderWinCard(item, index))}
						</div>
					</div>
				</Container>
			</section>
			<div className={styles['plane-game-first-page__content']}>
				<video ref={videoRef} className={styles['plane-game-first-page__animation']} src="/img/avia-masters-animation.MP4" preload="auto" loop autoPlay muted playsInline />
			</div>
			<div className={styles['plane-game-first-page__footer']}>
				<Container>
					<Button className={styles['play-button']} primary type="button" onClick={() => navigate('/plane-game')}>
						<span>{t('planeGameFirstPage.play')}</span>
						<StarsIcon width={20} height={20} />
					</Button>
				</Container>
			</div>
		</motion.div>
	)
}

export default PlaneGameFirstPage
