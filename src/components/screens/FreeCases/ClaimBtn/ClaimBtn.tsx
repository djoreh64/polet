import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useClaimTicketMutation } from '@/store/api/game.api'
import Button from '@/ui/Button/Button'
import styles from './ClaimBtn.module.scss'
import { useGetAccountQuery } from '@/store/api/profile.api'
import useTranslation from '@/hooks/useTranslation'
import { setIsPepeAvailable } from '@/store/ui/uiSlice'

export default function ClaimBtn() {
	const [claimTicket] = useClaimTicketMutation()
	const { data: accountData } = useGetAccountQuery()

	const dispatch = useDispatch()

	const { t } = useTranslation()

	const handleClaimTicket = () => {
		claimTicket()
		dispatch(setIsPepeAvailable(false)) // TODO: move to redux query on success
	}

	if (!accountData)
		return null

	return (
		<CountdownTimer
			timestamp={new Date(accountData?.next_pepe_claim_at).getTime()}
			onComplete={() => (
				<Button className={styles.claimButton} onClick={handleClaimTicket}>
					{t('freeCases.claimButton')}
				</Button>
			)}
		/>
	)
}

interface CountdownTimerProps {
	timestamp: number
	onComplete: () => React.ReactNode
}

export function CountdownTimer({ timestamp, onComplete }: CountdownTimerProps) {
	const targetTime = timestamp < 1e12 ? timestamp * 1000 : timestamp
	const [timeLeft, setTimeLeft] = useState(() => Math.max(0, targetTime - Date.now()))

	const dispatch = useDispatch()

	useEffect(() => {
		const interval = setInterval(() => {
			setTimeLeft(Math.max(0, targetTime - Date.now()))
		}, 1000)

		return () => clearInterval(interval)
	}, [targetTime])

	useEffect(() => {
		if (timeLeft <= 0) {
			dispatch(setIsPepeAvailable(true))
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [timeLeft])

	if (timeLeft <= 0) {
		return <>{onComplete()}</>
	}

	const formatTime = (ms: number) => {
		const totalSeconds = Math.floor(ms / 1000)
		const hours = Math.floor(totalSeconds / 3600)
		const minutes = Math.floor((totalSeconds % 3600) / 60)
		const seconds = totalSeconds % 60

		return [
			hours.toString().padStart(2, '0'),
			minutes.toString().padStart(2, '0'),
			seconds.toString().padStart(2, '0'),
		].join(':')
	}

	return (
		<div className={styles.countdownWrapper}>
			<span className={styles.countdown}>{formatTime(timeLeft)}</span>
		</div>
	)
}
