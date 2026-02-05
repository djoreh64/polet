import type { FC } from 'react'

import Item from '@/screens/Leaderboard/Item/Item.tsx'
import Container from '@/ui/Container/Container.tsx'

import type { RootState } from '@/store/store'
import { useSelector } from 'react-redux'
import styles from './List.module.scss'
import { useGetSeasonQuery } from '@/store/api/leaderboard.api'

const List: FC = () => {
	const selectedSeason = useSelector((state: RootState) => state.leaderboard.selectedSeason)
	const { data: leaderboardData } = useGetSeasonQuery(
		selectedSeason && 'id' in selectedSeason ? selectedSeason.id : undefined,
	)

	if (selectedSeason == null) {
		return null
	}

	return (
		<section className={styles.list}>
			<Container className={styles.container}>
				{leaderboardData?.top.map(item => (
					<Item
						position={item?.place}
						avatar={item?.pfp_url}
						name={item?.name}
						earning={item?.win_sum}
						key={item?.place}
						opened={item?.opened_count}
					/>
				))}
			</Container>
		</section>
	)
}

export default List
