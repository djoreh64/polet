export function cropAddress(address: string) {
	return `${address.substring(0, 4)}…${address.substring(address.length - 4)}`
}

export function salePrice(minPrice: number): number {
	const raw = minPrice * 0.8

	return Math.round(raw * 10) / 10
}

export function formatNumber(num: number): string {
	if (Number.isInteger(num)) {
		return num.toString()
	}
	return num.toFixed(2)
}

/**
 * Универсальная функция склонения слов по числу
 * @param count число
 * @param forms
 *   Для ru → [ед.ч. (1), род. ед.ч. (2–4), род. мн.ч. (5+)]
 *     например ["пепу", "пепы", "пеп"]
 *   Для en → [singular, plural]
 *     например ["pepe", "pepes"]
 * @param lang язык ("ru" или "en")
 */
export function pluralize(count: number, forms: string[], lang: 'ru' | 'en'): string {
	if (lang === 'en') {
		return count === 1 ? forms[0] : forms[1]
	}

	if (lang === 'ru') {
		const n = Math.abs(count) % 100
		const lastDigit = n % 10

		if (n > 10 && n < 20)
			return forms[2]
		if (lastDigit > 1 && lastDigit < 5)
			return forms[1]
		if (lastDigit === 1)
			return forms[0]
		return forms[2]
	}

	return ''
}

export interface TimeRemaining {
	days: number
	hours: number
	minutes: number
	seconds: number
}

export function calculateTimeRemaining(targetDate: Date): TimeRemaining | null {
	const now = new Date()
	const diff = targetDate.getTime() - now.getTime()

	if (diff <= 0) {
		return null
	}

	const days = Math.floor(diff / (1000 * 60 * 60 * 24))
	const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
	const seconds = Math.floor((diff % (1000 * 60)) / 1000)

	return { days, hours, minutes, seconds }
}

export function formatTimer(time: TimeRemaining): string {
	const d = String(time.days).padStart(1, '0')
	const h = String(time.hours).padStart(2, '0')
	const m = String(time.minutes).padStart(2, '0')
	const s = String(time.seconds).padStart(2, '0')
	return `${d}:${h}:${m}:${s}`
}
