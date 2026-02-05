import { PrizeTypeEnum } from '@/store/api/content.api'
import type { Reward } from '@/store/api/content.api'

export function shuffleArray<T>(array: T[]): T[] {
	const newArray = [...array]
	for (let i = newArray.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
	}
	return newArray
}

// Сравнение двух наград: Gift vs Gift (по model + type) или Dust vs Dust (по name)
export function isSameReward(a: Reward, b: Reward): boolean {
	if (a.type === PrizeTypeEnum.GIFT && b.type === PrizeTypeEnum.GIFT)
		return a.id === b.id

	return false
}

export function mixWithoutConsecutive(array: Array<Reward>): Array<Reward> {
	const result = [...array]
	for (let i = 1; i < result.length; i++) {
		if (isSameReward(result[i], result[i - 1])) {
			let j = i + 1
			while (j < result.length && isSameReward(result[i], result[j]))
				j++
			if (j < result.length)
				[result[i], result[j]] = [result[j], result[i]]
		}
	}
	return result
}

export function limitDivineCount(array: Array<Reward>, max = 3, targetLength = 65): Array<Reward> {
	const result: Array<Reward> = []
	const nonDivinePool: Array<Reward> = []
	let divineSeen = 0

	for (const item of array) {
		if (item.type === PrizeTypeEnum.GIFT && item.rarity === 'DIVINE') {
			if (divineSeen < max) {
				result.push(item)
				divineSeen++
			}
		}
		else {
			result.push(item)
			nonDivinePool.push(item)
		}
	}

	while (result.length < targetLength && nonDivinePool.length) {
		const randomIdx = Math.floor(Math.random() * nonDivinePool.length)
		result.push(nonDivinePool[randomIdx])
	}

	return result.slice(0, targetLength)
}

export function getRewardRarity(item: Reward): string {
	if (item.type === PrizeTypeEnum.GIFT)
		return item.rarity
	return 'TON'
}

export function diversifyByRarity(array: Array<Reward>): Array<Reward> {
	const result = [...array]
	for (let i = 1; i < result.length; i++) {
		if (getRewardRarity(result[i]) === getRewardRarity(result[i - 1])) {
			let j = i + 1
			while (j < result.length && getRewardRarity(result[j]) === getRewardRarity(result[i]))
				j++
			if (j < result.length)
				[result[i], result[j]] = [result[j], result[i]]
		}
	}
	return result
}

export function avoidConsecutiveGifts(array: Array<Reward>): Array<Reward> {
	const result = [...array]
	for (let i = 1; i < result.length; i++) {
		if (result[i].type === PrizeTypeEnum.GIFT && result[i - 1].type === PrizeTypeEnum.GIFT) {
			let j = i + 1
			while (j < result.length && result[j].type === PrizeTypeEnum.GIFT)
				j++
			if (j < result.length)
				[result[i], result[j]] = [result[j], result[i]]
		}
	}
	return result
}

export function avoidDivineAtStart(array: Array<Reward>, safeCount = 5): Array<Reward> {
	const result = [...array]
	for (let i = 0; i < Math.min(safeCount, result.length); i++) {
		const item = result[i]
		if (item.type === PrizeTypeEnum.GIFT && item.rarity === 'DIVINE') {
			let j = safeCount
			while (j < result.length && result[j].type === PrizeTypeEnum.GIFT && result[j].rarity === 'DIVINE')
				j++
			if (j < result.length)
				[result[i], result[j]] = [result[j], result[i]]
		}
	}
	return result
}

export function fixAdjacentDuplicates(array: Array<Reward>): Array<Reward> {
	const result = [...array]
	for (let i = 1; i < result.length; i++) {
		if (isSameReward(result[i], result[i - 1])) {
			let j = i + 1
			while (j < result.length && isSameReward(result[i], result[j]))
				j++
			if (j < result.length)
				[result[i], result[j]] = [result[j], result[i]]
		}
	}
	return result
}

export function getFixedLengthArray(base: unknown[], length = 40): any[] {
	if (base.length === 0)
		return []

	const repeats = Math.ceil(length / base.length)

	let extended: unknown[] = []
	for (let i = 0; i < repeats; i++)
		extended = extended.concat(base)

	extended = shuffleArray(extended)
	extended = mixWithoutConsecutive(extended as Array<Reward>)

	return (extended as Array<Reward>).slice(0, length)
}
