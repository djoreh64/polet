import type { FC } from 'react'

import { useGetReferralInfoQuery, useGetTasksQuery } from '@/api/profile.api.ts'

import Container from '@/ui/Container/Container.tsx'

import type { TaskType } from '@/screens/Earn/Tasks/List/Task/Task'
import Task from '@/screens/Earn/Tasks/List/Task/Task'
import styles from './List.module.scss'

const List: FC = () => {
	const { data: tasksData, isSuccess } = useGetTasksQuery()
	const { data: referralData, isSuccess: isReferralDataSuccess } = useGetReferralInfoQuery()
	const invitedReferrals = isReferralDataSuccess ? referralData?.referral_count : 0

	return (
		<section className={styles.list}>
			<Container className={styles.container}>
				{isSuccess && tasksData?.tasks?.map(item => (
					<Task
						id={item?.id}
						type={item?.task_type as unknown as TaskType}
						reward={item?.bonus}
						isCompleted={item?.is_completed}
						channelLink={item?.partnership_data?.link as string}
						boostLink={item?.partnership_data?.link as string}
						requiredFriends={item?.referral_data?.min_count}
						invitedReferrals={invitedReferrals}
						key={item?.id as string}
						title={item?.name as string}
						actionType={item?.partnership_data?.action_type as string}
					/>
				))}
			</Container>
		</section>
	)
}

export default List
