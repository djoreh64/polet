import useTranslation from '@/hooks/useTranslation'
import Item from '@/screens/Leaderboard/Item/Item'
import { useGetReferralTopQuery } from '@/store/api/profile.api'
import Container from '@/ui/Container/Container'
import styles from './Friends.module.scss'

function Friends() {
	const { data: topReferrals } = useGetReferralTopQuery()

	const { t } = useTranslation()

	if (!topReferrals || (topReferrals.items.length < 1)) {
		return null
	}

	return (
		<Container className={styles.container}>
			<h2 className={styles.title}>{t('earn.referrals.friends')}</h2>
			<div className={styles.list}>
				{topReferrals.items.map((item, idx) => (
					<Item
						position={idx + 1}
						avatar={item?.pfp_url}
						name={item?.first_name}
						earning={item?.profit}
						key={item?.user_id}
						opened={item?.cases_opened}
					/>
				))}
			</div>
		</Container>

	)
}

export default Friends
