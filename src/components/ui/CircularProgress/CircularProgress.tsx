import { useEffect, useState } from 'react'
import './CircullarProgress.scss'

interface CircularProgressProps {
	value: number
	size?: number
}

export function CircularProgress({ value, size = 24 }: CircularProgressProps) {
	const [progress, setProgress] = useState(0)

	// Animate the progress
	useEffect(() => {
		const timer = setTimeout(() => {
			setProgress(value)
		}, 100)

		return () => clearTimeout(timer)
	}, [value])

	return (
		<div
			className="circular-progress"
			style={{
				'width': `${size}px`,
				'height': `${size}px`,
				'--progress-value': `${progress}%`,
			} as React.CSSProperties}
		>
			<div className="progress-background"></div>
			<div className="progress-fill"></div>
			<div className="progress-cover"></div>
		</div>
	)
}
