import leftChevron from '@/assets/leftChevron.svg'
import rightChevron from '@/assets/rightChevron.svg'
import useOpenCase from '@/hooks/useOpenCase.ts'
import Case from '@/screens/Home/Case/Case'
import { useGetCasesQuery } from '@/store/api/content.api'
import { setIsShowDropModal } from '@/store/ui/uiSlice'
import { setCurrentCrystal } from '@/store/openCase/crystalSlice'
import type { RootState } from '@/store/store'
import cn from 'classnames'
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styles from './CrystalSlider.module.scss'

const openAnimation = { opacity: 0, transition: { duration: 0.5 } }

export default function CrystalSlider() {
	const { isOpening } = useOpenCase()
	const { data: casesData } = useGetCasesQuery()
	const filteredCrystals = useMemo(() => (casesData ?? []).filter(crystal => crystal.type !== 'pepes'), [casesData])
	const currentCrystal = useSelector((state: RootState) => state.crystals.currentCrystal)
	const dispatch = useDispatch()
	const [isScrolling, setIsScrolling] = useState(false)

	const [initialIndex] = useState(() => {
		if (!filteredCrystals.length)
			return 0
		const desiredId = currentCrystal?.id
		const idx = filteredCrystals.findIndex(c => c.id === desiredId)
		return idx !== -1 ? idx : 0
	})

	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, containScroll: 'trimSnaps', startIndex: initialIndex })

	const updateSelected = useCallback(() => {
		if (!emblaApi || isScrolling)
			return
		const index = emblaApi.selectedScrollSnap()
		if (filteredCrystals && filteredCrystals.length > 0) {
			const currentCrystal = filteredCrystals[index]
			if (currentCrystal) {
				dispatch(setCurrentCrystal(currentCrystal))
			}
		}
	}, [filteredCrystals, dispatch, emblaApi, isScrolling])

	useLayoutEffect(() => {
		if (!emblaApi)
			return
		emblaApi.on('select', updateSelected)
		return () => {
			emblaApi.off('select', updateSelected)
		}
	}, [emblaApi, updateSelected])

	useEffect(() => {
		if (!emblaApi || !filteredCrystals.length)
			return

		const desiredId = currentCrystal?.id
		const idx = filteredCrystals.findIndex(c => c.id === desiredId)
		const targetIndex = idx !== -1 ? idx : 0

		if (emblaApi.selectedScrollSnap() !== targetIndex) {
			emblaApi.scrollTo(targetIndex, true)
		}
		const crystal = filteredCrystals[targetIndex]
		if (crystal) {
			dispatch(setCurrentCrystal(crystal))
		}
	}, [emblaApi, filteredCrystals, dispatch, currentCrystal?.id])

	useLayoutEffect(() => {
		if (!emblaApi || !filteredCrystals.length || !currentCrystal)
			return
		const index = filteredCrystals.findIndex(c => c.id === currentCrystal.id)
		if (index !== -1 && index !== emblaApi.selectedScrollSnap()) {
			emblaApi.scrollTo(index, true)
		}
	}, [filteredCrystals, currentCrystal, emblaApi])

	const scrollWithDelay = useCallback((scrollFn: () => void) => {
		if (!emblaApi || isScrolling)
			return

		setIsScrolling(true)
		scrollFn()

		const timer = setTimeout(() => {
			setIsScrolling(false)
			updateSelected()
		}, 300)

		return () => clearTimeout(timer)
	}, [emblaApi, isScrolling, updateSelected])

	const scrollPrev = () => scrollWithDelay(() => emblaApi?.scrollPrev())
	const scrollNext = () => scrollWithDelay(() => emblaApi?.scrollNext())

	if (filteredCrystals.length === 0) {
		return null
	}

	return (
		<div className={styles.slider}>
			<div className={cn(styles.embla, isOpening && styles.disabled)} ref={emblaRef}>
				<div className={styles.emblaContainer}>
					{filteredCrystals.map(({ id, file_url }) => (
						<div className={styles.emblaSlide} key={id}>
							<Case
								openingAnimation={openAnimation}
								staticAnimation={file_url}
								// TODO: static animation staticAnimation={}
							/>
							<div className={styles.emblaSlideOverlay} onClick={() => dispatch(setIsShowDropModal(true))} />
						</div>
					))}
				</div>
				{!isOpening && (
					<>
						<button
							type="button"
							className={styles.prevButton}
							onClick={scrollPrev}
							aria-label="Previous slide"
							disabled={isScrolling}
						>
							<img src={leftChevron} alt="prev" />
						</button>
						<button
							type="button"
							className={styles.nextButton}
							onClick={scrollNext}
							aria-label="Next slide"
							disabled={isScrolling}
						>
							<img src={rightChevron} alt="next" />
						</button>
					</>
				)}
			</div>
		</div>
	)
}
