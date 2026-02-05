import { useEffect, useState } from 'react'
import tonImg1 from '@/assets/image1.png'
import tonImg2 from '@/assets/image2.png'
import tonImg3 from '@/assets/image3.png'
import promocode from '@/assets/promo.png'

interface UseGiftModelResult {
	lottie: Record<string, any> | null
	png: string | null
	loading: boolean
	error: Error | null
}

export interface UseGiftModelOptions {
	lottie?: boolean
	forceModelAsLottie?: boolean
}

const BASE_URL = 'https://cdn.changes.tg/gifts/models'

export function useGiftModel(
	giftName: string,
	modelName: string | undefined,
	options: UseGiftModelOptions = { lottie: false, forceModelAsLottie: false },
): UseGiftModelResult {
	const { lottie: fetchLottie = true } = options

	const [lottie, setLottie] = useState<Record<string, any> | null>(null)
	const [png, setPng] = useState<string | null>(null)
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		if (options.forceModelAsLottie && modelName) {
			const cancelled = false
			setLoading(true)
			setError(null)
			fetch(modelName)
				.then((res) => {
					if (!res.ok) {
						throw new Error(`Failed to fetch Lottie model: ${res.status} ${res.statusText}`)
					}
					return res.json()
				})
				.then((data) => {
					if (!cancelled) {
						setLottie(data)
					}
				})
				.catch((err) => {
					if (!cancelled) {
						setError(err)
					}
				})
				.finally(() => {
					if (!cancelled) {
						setLoading(false)
					}
				})
			return
		}
		if (giftName === 'promocode' && !modelName) {
			setLottie(null)
			setPng(promocode)
			setLoading(false)
			return
		}

		if (giftName && !modelName) {
			setLottie(null)
			setPng(getTonImg(giftName))
			setLoading(false)
			return
		}
		if (!giftName || !modelName) {
			setLottie(null)
			setPng(null)
			setLoading(false)
			return
		}

		let cancelled = false
		setLoading(true)
		setError(null)

		const normalizeAndEncode = (str: string) =>
			encodeURIComponent(str.replace(/’/g, '\''))

		const encodedGift = normalizeAndEncode(giftName)
		const encodedModel = normalizeAndEncode(modelName)

		const pngFileUrl = `${BASE_URL}/${encodedGift}/png/${encodedModel}.png`

		if (fetchLottie) {
			const lottieUrl = `${BASE_URL}/${encodedGift}/lottie/${encodedModel}.json`
			fetch(lottieUrl)
				.then((res) => {
					if (!res.ok) {
						throw new Error(`Failed to fetch Lottie model: ${res.status} ${res.statusText}`)
					}
					return res.json()
				})
				.then((data) => {
					if (!cancelled) {
						setLottie(data)
					}
				})
				.catch((err) => {
					if (!cancelled) {
						setError(err)
					}
				})
				.finally(() => {
					if (!cancelled) {
						setLoading(false)
					}
				})
		}
		else {
			setLottie(null)
			setLoading(false)
		}

		setPng(pngFileUrl)

		return () => {
			cancelled = true
		}
	}, [giftName, modelName, fetchLottie])

	return { lottie, png, loading, error }
}

export default useGiftModel

export function getTonImg(giftName: string): string {
	switch (giftName) {
		case 'DUST_1':
			return tonImg1

		case 'DUST_2':
			return tonImg2

		case 'DUST_3':
			return tonImg3

		default:
			return tonImg1
	}
}
