import { useLayoutEffect, useMemo } from 'react'
import type { FC } from 'react'
import useEmblaCarousel from 'embla-carousel-react'

import { useGetReferralLevelsQuery } from '@/api/content.api.ts'
import useTelegram from '@/hooks/useTelegram.ts'
import useTranslation from '@/hooks/useTranslation.ts'

import Button from '@/ui/Button/Button.tsx'
import Container from '@/ui/Container/Container.tsx'

import LevelCard from '@/screens/Earn/Referrals/LevelCard/LevelCard'
import styles from './Invite.module.scss'
import { useGetReferralInfoQuery } from '@/store/api/profile.api'

const Invite: FC = () => {
	const { t } = useTranslation()
	const [emblaRef, emblaApi] = useEmblaCarousel({
		loop: false,
		containScroll: 'trimSnaps',
		align: 'start',
		dragFree: false,
	})

	const { webApp } = useTelegram()
	const { data: levelsData, isSuccess: isLevelsSuccess } = useGetReferralLevelsQuery()
	const { data: infoData, isLoading: isInfoLoading } = useGetReferralInfoQuery()

	const sortedLevelsData = useMemo(() => {
		if (!levelsData)
			return []
		return [...levelsData.levels].sort((a, b) => a.id - b.id)
	}, [levelsData])

	useLayoutEffect(() => {
		if (!emblaApi || !sortedLevelsData.length || !infoData?.referral_level || isInfoLoading)
			return

		const currentLevelIndex = sortedLevelsData.findIndex(level => level.id === infoData?.referral_level.id)
		if (currentLevelIndex !== -1) {
			emblaApi.scrollTo(currentLevelIndex, true)
		}
	}, [emblaApi, sortedLevelsData, infoData?.referral_level, isInfoLoading])

	const handleButtonClick = () => {
		if (infoData?.referral_link) {
			webApp.openTelegramLink(`https://t.me/share/url?url=${infoData?.referral_link}`)
		}
	}

	return (
		<section className={styles.invite}>
			<Container>
				<div className={styles.inner}>
					<div className={styles.carousel}>
						{!isInfoLoading && isLevelsSuccess && (
							<div className={styles.embla} ref={emblaRef}>
								<div className={styles.emblaContainer}>
									{
										sortedLevelsData.map((levelData, index) => (
											<div className={styles.emblaSlide} key={levelData.id}>
												<LevelCard
													id={levelData.id}
													name={levelData.name}
													targetReferrals={sortedLevelsData[index + 1]?.min_referrals || 0}
													targetVolume={sortedLevelsData[index + 1]?.min_total_deposit || 0}
													percentage={levelData.percent}
													minReferrals={levelData.min_referrals}
													minVolume={levelData.min_total_deposit}
													isExclusive={levelData.is_exclusive}
												/>
											</div>
										))
									}
								</div>
							</div>
						) }

					</div>
					<Button className={styles.button} onClick={handleButtonClick} primary>{t('earn.referrals.invite.button')}</Button>
				</div>
			</Container>
		</section>
	)
}

export default Invite
