import { useGetLeaderboardQuery, useGetSeasonsQuery } from '@/store/api/leaderboard.api'
import { openModal, selectSeason } from '@/store/leaderboard/leaderboardSlice'
import type { RootState } from '@/store/store'
import Button from '@/ui/Button/Button'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styles from './SeasonBar.module.scss'

function SeasonBar() {
	const dispatch = useDispatch()
	const { data: leaderboardData } = useGetLeaderboardQuery()
	const { data: seasons } = useGetSeasonsQuery()
	const selectedSeason = useSelector((state: RootState) => state.leaderboard.selectedSeason)

	useEffect(() => {
		if (!leaderboardData) {
			return
		}

		// Default tab: All Time (backend currently returns season=0 for all-time)
		if (selectedSeason == null) {
			dispatch(selectSeason({ kind: 'all_time' }))
			return
		}

		// If a season is selected, keep it in sync with refreshed seasons list
		if ('id' in selectedSeason) {
			const updatedSeason = seasons?.seasons?.find(s => s.id === selectedSeason.id)
			if (updatedSeason && JSON.stringify(selectedSeason) !== JSON.stringify(updatedSeason)) {
				dispatch(selectSeason(updatedSeason))
			}
		}
	}, [leaderboardData, dispatch, selectedSeason, seasons?.seasons])

	if (!leaderboardData) {
		// TODO: make Skeleton
		return null
	}

	return (
		<div className={styles.tabs}>
			<Button
				className={`${styles.tab} ${
					selectedSeason?.kind === 'all_time' ? styles.active : ''
				}`}

				onClick={() => {
					dispatch(selectSeason({ kind: 'all_time' }))
				}}
			>
				<span className={styles.title}>
					<span className={styles.back}>All Time</span>
					All Time
					<span className={styles.front}>All Time</span>
				</span>
			</Button>
			{seasons?.seasons.slice(0, 2).map(season => (
				<button
					type="button"
					key={season.id}
					className={`${styles.tab} ${
						selectedSeason?.id === season.id ? styles.active : ''
					}`}
					onClick={() => {
						dispatch(selectSeason(season))
					}}
				>
					Season
					{' '}
					{season.id}
				</button>
			))}
			<Button className={styles.tab} secondary onClick={() => dispatch(openModal())}>See All</Button>
		</div>
	)
}

export default SeasonBar
