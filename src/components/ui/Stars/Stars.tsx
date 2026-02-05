import type { FC } from 'react'

import cn from 'classnames'
import { useCallback, useEffect, useRef } from 'react'

import styles from './Stars.module.scss'

interface IStar {
	x: number
	y: number
	length: number
	opacity: number
	factor: number
	increment: number
	baseOpacity: number
}

class Star implements IStar {
	x: number
	y: number
	length: number
	opacity: number
	factor: number
	increment: number
	baseOpacity: number

	constructor(x: number, y: number, length: number, twinkleSpeed: number) {
		this.x = Number.parseInt(String(x), 10)
		this.y = Number.parseInt(String(y), 10)
		this.length = Number.parseInt(String(length), 10)
		this.baseOpacity = 0.5 + Math.random() * 0.3
		this.opacity = this.baseOpacity
		this.factor = Math.random() > 0.5 ? 1 : -1

		this.increment = (0.0005 + Math.random() * 0.0005) * twinkleSpeed
	}

	draw(context: CanvasRenderingContext2D, twinkleRange: number) {
		// Обновляем прозрачность
		if (this.opacity > this.baseOpacity + twinkleRange) {
			this.factor = -1
		}
		else if (this.opacity < this.baseOpacity - twinkleRange) {
			this.factor = 1
		}
		this.opacity += this.increment * this.factor

		// Сохраняем состояние контекста
		context.save()

		// Сбрасываем трансформации для этой звезды
		context.setTransform(1, 0, 0, 1, this.x, this.y)
		context.rotate(Math.PI / 10)

		// Рисуем звезду
		context.beginPath()
		for (let i = 5; i--;) {
			context.lineTo(0, this.length)
			context.translate(0, this.length)
			context.rotate((Math.PI * 2) / 10)
			context.lineTo(0, -this.length)
			context.translate(0, -this.length)
			context.rotate(-(Math.PI * 6) / 10)
		}
		context.lineTo(0, this.length)
		context.closePath()

		// Стиль с проверкой границ прозрачности
		const opacity = Math.max(0, Math.min(1, this.opacity))
		context.fillStyle = `rgba(255, 255, 200, ${opacity})`
		context.shadowBlur = 5
		context.shadowColor = '#fff'
		context.fill()

		// Восстанавливаем контекст
		context.restore()
	}
}

interface StarsProps {
	numStars?: number
	className?: string
	twinkleSpeed?: number
	twinkleRange?: number
}

const Stars: FC<StarsProps> = ({ numStars = 55, className, twinkleSpeed = 4, twinkleRange = 0.5 }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const starsRef = useRef<Star[]>([])
	const animationRef = useRef<number>(0)

	const twinkleSpeedRef = useRef(twinkleSpeed)
	const twinkleRangeRef = useRef(twinkleRange)

	const createStars = useCallback((screenW: number, screenH: number) => {
		if (starsRef.current.length === 0) {
			for (let i = 0; i < numStars; i++) {
				const x = Math.round(Math.random() * screenW)
				const y = Math.round(Math.random() * screenH)
				const length = 1 + Math.random() * 1.5

				const star = new Star(x, y, length, twinkleSpeedRef.current)

				starsRef.current.push(star)
			}
		}
	}, [numStars, twinkleSpeedRef])

	useEffect(() => {
		twinkleSpeedRef.current = twinkleSpeed
		twinkleRangeRef.current = twinkleRange

		if (starsRef.current.length > 0) {
			starsRef.current = []
			const canvas = canvasRef.current
			if (canvas) {
				createStars(canvas.width, canvas.height)
			}
		}
	}, [twinkleSpeed, twinkleRange, numStars, createStars])

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas)
			return

		const context = canvas.getContext('2d')
		if (!context)
			return

		const updateCanvasSize = () => {
			const screenH = window.innerHeight
			const screenW = window.innerWidth

			canvas.height = screenH
			canvas.width = screenW

			createStars(screenW, screenH)
		}

		updateCanvasSize()

		window.addEventListener('resize', updateCanvasSize)

		const animate = () => {
			if (!canvas || !context)
				return

			context.clearRect(0, 0, canvas.width, canvas.height)

			starsRef.current.forEach((star) => {
				star.draw(context, twinkleRangeRef.current)
			})

			animationRef.current = requestAnimationFrame(animate)
		}

		animate()

		return () => {
			window.removeEventListener('resize', updateCanvasSize)
			cancelAnimationFrame(animationRef.current)
		}
	}, [createStars, twinkleRangeRef])

	return <canvas ref={canvasRef} className={cn(styles.stars, className)} />
}

export default Stars
