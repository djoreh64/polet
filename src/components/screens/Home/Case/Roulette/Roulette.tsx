/* eslint-disable react/no-array-index-key */

import { contentApi, PrizeTypeEnum } from '@/api/content.api'
import useOpenCase from '@/hooks/useOpenCase'
import type { RootState } from '@/store/store'
import type { Rarity } from '@/ui/BackgroundPattern/BackgroundPattern'
import GiftCard from '@/ui/GiftCard/GiftCard'
import { motion, useAnimate } from 'motion/react'
import {
	avoidConsecutiveGifts,
	avoidDivineAtStart,
	diversifyByRarity,
	fixAdjacentDuplicates,
	getFixedLengthArray,
	isSameReward,
	limitDivineCount,
} from '@/utils/rouletteHelpers'
import type { FC } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import useTelegram from '@/hooks/useTelegram'
import styles from './Roulette.module.scss'
import type { Reward } from '@/store/api/content.api'

const CONFIG = {
	ANIMATION_DURATION: 12,
	DUPLICATIONS: 65,
	EASE_FUNCTION: [0.25, 1, 0.25, 0.99],
} as const

interface RouletteProps {
	isOpenRoulette: boolean
}

const Roulette: FC<RouletteProps> = ({ isOpenRoulette }) => {
	const currentCrystal = useSelector(
		(state: RootState) => state.crystals.currentCrystal,
		shallowEqual,
	)

	const { caseItem } = useOpenCase()
	const { webApp } = useTelegram()
	const dispatch = useDispatch()

	const navigate = useNavigate()

	const containerRef = useRef<HTMLDivElement | null>(null)
	const targetRef = useRef<HTMLDivElement | null>(null)
	const [scope, animate] = useAnimate()
	const lastVibratedIndex = useRef(-1)

	const frozenGiftsRef = useRef<Reward[] | null>(null)
	useEffect(() => {
		if (isOpenRoulette && currentCrystal?.rewards && !frozenGiftsRef.current) {
			frozenGiftsRef.current = currentCrystal.rewards
		}
	}, [isOpenRoulette, currentCrystal?.rewards])

	const dataForSpin = frozenGiftsRef.current ?? currentCrystal?.rewards

	const duplicates = useMemo(() => {
		if (!dataForSpin?.length)
			return []

		const base = [...dataForSpin]

		if (!base.length) {
			return []
		}

		let randomized = getFixedLengthArray(base, CONFIG.DUPLICATIONS) as Array<Reward>

		randomized = limitDivineCount(randomized, 3, CONFIG.DUPLICATIONS)
		randomized = diversifyByRarity(randomized)
		randomized = avoidConsecutiveGifts(randomized)
		randomized = avoidDivineAtStart(randomized, 5)
		randomized = fixAdjacentDuplicates(randomized)

		return randomized
	}, [dataForSpin])

	const fullGiftList = useMemo(() => {
		if (!caseItem) {
			return duplicates
		}

		const filteredGifts = duplicates.filter(gift => caseItem.id !== gift.id)

		const tail = filteredGifts.slice(7, 12).filter(item => caseItem.id !== item.id)

		return [...filteredGifts, caseItem, ...tail]
	}, [duplicates, caseItem])

	useEffect(() => {
		if (!caseItem || !fullGiftList?.length)
			return
		console.log('🔍 caseItem', caseItem)
		const found = fullGiftList.some((g: Reward) => g.id === caseItem.id)
		if (!found) {
			console.warn('[Roulette] Winning item NOT found in fullGiftList', { caseItem, listSample: fullGiftList.slice(0, 10) })
		}
		else {
			console.debug('[Roulette] Winning item found in fullGiftList', {
				len: fullGiftList.length,
				fullGiftList,
				isPromo: fullGiftList.some(g => g.type === PrizeTypeEnum.PROMOCODE),
				ts: Date.now(),
			})
		}
	}, [caseItem, fullGiftList, dataForSpin])

	const vibrateOnScroll = () => {
		if (!webApp || !webApp.HapticFeedback || !webApp.HapticFeedback.impactOccurred) {
			if ('vibrate' in navigator) {
				navigator.vibrate(50)
			}
			return
		}

		if (!scope.current || !containerRef.current) {
			return
		}

		const markerCenter = containerRef.current.getBoundingClientRect().left + containerRef.current.offsetWidth / 2
		const giftCards = scope.current.querySelectorAll(`.${styles.gift}`)

		giftCards.forEach((card: Element, index: number) => {
			const rect = card.getBoundingClientRect()
			const cardRight = rect.right
			const threshold = 15

			if (Math.abs(markerCenter - cardRight - 19) < threshold && lastVibratedIndex.current !== index) {
				webApp.HapticFeedback.impactOccurred('light')
				lastVibratedIndex.current = index
			}
		})

		if (caseItem) {
			requestAnimationFrame(vibrateOnScroll)
		}
	}

	useEffect(() => {
		if (!isOpenRoulette || !containerRef.current || !scope.current || !caseItem) {
			return
		}

		const timeoutId = setTimeout(() => {
			if (!targetRef.current) {
				console.warn('targetRef not found, retrying...')
				return
			}

			const containerRect = containerRef.current!.getBoundingClientRect()
			const targetRect = targetRef.current.getBoundingClientRect()
			const scopeRect = scope.current!.getBoundingClientRect()
			const markerCenter = containerRect.left + containerRect.width / 2
			const targetCenter = targetRect.left - scopeRect.left + Math.floor(Math.random() * (targetRect.width - 4)) + 2
			const deltaX = markerCenter - (scopeRect.left + targetCenter)

			let completionTimeoutId: ReturnType<typeof setTimeout>

			const controls = animate(scope.current!, { x: deltaX }, {
				duration: CONFIG.ANIMATION_DURATION,
				ease: CONFIG.EASE_FUNCTION,
				delay: 0.6,
				onComplete: () => {
					const newTargetPos = targetRef.current!.getBoundingClientRect()
					const newScopePos = scope.current!.getBoundingClientRect()
					const centerOffset = markerCenter - (newScopePos.left + (newTargetPos.left - newScopePos.left) + newTargetPos.width / 2)
					if (Math.abs(centerOffset) > 1) {
						scope.current!.style.transform = `translateX(${deltaX + centerOffset}px)`
					}
					completionTimeoutId = setTimeout(() => {
						console.log('✅ Анимация завершена. Победный айтем под маркером:', caseItem)

						dispatch(contentApi.util.invalidateTags(['ActiveGifts', 'Wins', 'Leaderboard']))

						if (caseItem?.type === PrizeTypeEnum.GIFT) {
							navigate(`/${caseItem?.id}`)
						}
						else if (caseItem?.type === PrizeTypeEnum.DUST) {
							navigate(`/${caseItem?.id}`)
						}
						else if (caseItem?.type === PrizeTypeEnum.PROMOCODE) {
							navigate(`/${caseItem?.amount}`)
						}
					}, 100)
				},
			})

			requestAnimationFrame(vibrateOnScroll)

			controls.play()

			return () => {
				controls.stop()
				clearTimeout(completionTimeoutId)
			}
		}, 50)

		return () => {
			clearTimeout(timeoutId)
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [animate, caseItem, isOpenRoulette, navigate, scope, dispatch, fullGiftList, webApp])

	if (!dataForSpin?.length) {
		return <div>Loading...</div>
	}

	return (
		<div className={styles.rouletteWrapper} id="roulette">
			<div className={styles.marker} />
			<div className={styles.rouletteContainer} ref={containerRef}>
				<motion.div ref={scope} className={styles.giftList}>
					{fullGiftList.map((reward, index: number) => {
						const isWinning = caseItem ? reward.id === caseItem.id : false

						if (reward.type === PrizeTypeEnum.GIFT && reward.type) {
							return (
								<div key={`${reward.id}-${index}`} ref={isWinning ? targetRef : null}>
									<GiftCard
										file_url={reward.file_url}
										className={styles.gift}
										size="large"
										rarity={reward.rarity as Rarity}
										gift={reward.type}
										model={reward.model ?? ''}
										value={reward.amount}
									/>
								</div>
							)
						}

						if (reward.type === PrizeTypeEnum.DUST && reward.type && reward.amount) {
							return (
								<div key={`${reward.type}-${index}`} ref={isWinning ? targetRef : null}>
									<GiftCard
										file_url={reward.file_url}
										className={styles.gift}
										size="large"
										rarity={'TON' as Rarity}
										gift={reward.type}
										value={reward.amount}
									/>
								</div>
							)
						}

						if (reward.type === PrizeTypeEnum.PROMOCODE && reward.amount) {
							return (
								<div key={`${reward.type}-${index}`} ref={isWinning ? targetRef : null}>
									<GiftCard
										file_url={reward.file_url}
										className={styles.gift}
										size="large"
										rarity={'EPIC' as Rarity}
										gift={reward.type}
										value={`${reward.promocode?.deposit_bonus}%`}
									/>
								</div>
							)
						}
						return null
					})}
				</motion.div>
			</div>
		</div>
	)
}

export default Roulette
