import type { FC } from 'react'

import { useGetLeaderboardQuery } from '@/api/leaderboard.api.ts'
import { useGetInfoQuery } from '@/api/profile.api.ts'

import Container from '@/ui/Container/Container.tsx'

import WalletConnect from '@/ui/WalletConnect/WalletConnect'
import styles from './Profile.module.scss'

const Profile: FC = () => {
	const { data: infoData } = useGetInfoQuery()
	const { data: leaderboardData, isSuccess: isLeaderboardSuccess } = useGetLeaderboardQuery()

	return (
		<section className={styles.profile}>
			<Container>
				<div className={styles.user}>
					<div className={styles.avatar}>
						<img
							className={styles.img}
							src={infoData?.pfp_url}
							alt={infoData?.username}
						/>
						{leaderboardData?.current_user?.place && (
							<div className={styles.badge}>
								{isLeaderboardSuccess && formatNumber(leaderboardData?.current_user?.place)}
							</div>
						)}
					</div>
					<h3 className={styles.username}>
						{` ${infoData?.first_name} ${infoData?.last_name}`}
					</h3>
					<WalletConnect />
				</div>
			</Container>
		</section>
	)
}

function formatNumber(n: number): string {
	if (n < 1000) {
		return `#${n}`
	}

	const thousands = Math.floor(n / 1000)
	return `#${thousands}k+`
}

export default Profile
