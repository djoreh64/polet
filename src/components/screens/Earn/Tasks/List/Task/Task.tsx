import type { FC } from 'react'

import { useCompleteTaskMutation } from '@/api/profile.api.ts'
import useTelegram from '@/hooks/useTelegram.ts'
import useTranslation from '@/hooks/useTranslation.ts'

import Button from '@/ui/Button/Button.tsx'
import { CircularProgress } from '@/ui/CircularProgress/CircularProgress'

import Icon from '@/ui/Icon/Icon.tsx'
import cn from 'classnames'

import { useState } from 'react'
import styles from './Task.module.scss'

export type TaskType = 'referral' | 'channel' | 'partnership'

type TaskStatus = 'check' | 'collect' | 'completed' | 'link'

interface BaseTask {
	type: TaskType
	id: string
	reward: number
	isCompleted: boolean
	title: string
}

type TaskProps = BaseTask & {
	invitedReferrals: number
	requiredFriends?: number
	channelLink?: string
	boostLink?: string
	actionType?: string
}

const Task: FC<TaskProps> = (props) => {
	const { type, reward, isCompleted = false, title } = props

	const current = props.invitedReferrals
	const total = props.requiredFriends || 0
	const progress = (current / total) * 100

	const [status, setStatus] = useState<TaskStatus>(() => {
		if (isCompleted)
			return 'completed'

		if (type === 'referral') {
			const total = props.requiredFriends || 0
			const current = props.invitedReferrals

			if (total > 0 && current >= total)
				return 'collect'

			return 'check'
		}

		return 'check'
	})

	const { webApp } = useTelegram()
	const [completeTask] = useCompleteTaskMutation()

	const handleButtonClick = async () => {
		if (type === 'partnership') {
			if (status === 'check' || status === 'link') {
				const link = title.includes('BOOST') ? props?.boostLink : props?.channelLink
				// Для задач вида "link" сначала отправляем запрос на проверку, потом открываем ссылку
				if (props.actionType === 'link') {
					try {
						const response = await completeTask({ task_id: props.id }).unwrap()
						if (response.ok) {
							setStatus('completed')
							webApp.openTelegramLink(link || '')
						}
						else {
							webApp.openTelegramLink(link || '')
						}
					}
					catch {
						webApp.openTelegramLink(link || '')
					}
				}
				else {
					// Для остальных задач сначала открываем ссылку, потом отправляем запрос
					if (title.includes('BOOST')) {
						webApp.openTelegramLink(props?.boostLink || '')
					}
					else {
						webApp.openTelegramLink(props?.channelLink || '')
					}

					try {
						const response = await completeTask({ task_id: props.id }).unwrap()
						if (response.ok) {
							setStatus('completed')
						}
						else {
							webApp.openTelegramLink(props?.channelLink || '')
						}
					}
					catch {

					}
				}
			}
		}
		else if (type === 'referral') {
			if (status === 'collect') {
				try {
					const response = await completeTask({ task_id: props.id }).unwrap()
					if (response.ok) {
						setStatus('completed')
					}
					else {
						setStatus('collect')
					}
				}
				catch {
					setStatus('collect')
				}
			}
		}
	}

	const { t } = useTranslation()

	return (
		<div className={styles.task}>
			<div className={styles.icon}>
				<Icon name={type} width={20} height={20} />
			</div>
			<div>
				<h3 className={styles.title}>
					{
						type === 'referral'
							? (
									<>
										{t('earn.tasks.task.title.friends.start')}
										{' '}
										{props.requiredFriends}
										{' '}
										{t('earn.tasks.task.title.friends.end')}
									</>
								)
							: t(`earn.tasks.task.title.${title}`)
					}
				</h3>
				<div className={styles.reward}>
					<span>{`+${reward}`}</span>
					<img src="/img/pepe.png" alt="Magic Pepe" width={16} height={16} />
				</div>
			</div>
			<div className={styles.buttonContainer}>
				<Button
					className={cn(
						styles.button,
						status === 'collect' && styles.collect,
						status === 'completed' && styles.completed,
						status === 'check' && type === 'channel' && styles.check,
					)}
					onClick={handleButtonClick}
					type="button"
					disabled={(status === 'check' && type === 'referral') || status === 'completed'}
				>
					{status === 'check' && type === 'partnership' && t('earn.tasks.task.button.check')}
					{status === 'check' && type === 'referral' && <CircularProgress value={progress} />}
					{status === 'collect' && t('earn.tasks.task.button.collect')}
					{status === 'completed' && <Icon name="completed" width={20} height={20} />}

				</Button>
			</div>
		</div>
	)
}

export default Task
