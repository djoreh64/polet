import useTelegram from './useTelegram'

type ImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'

export function useHapticFeedback() {
	const { webApp } = useTelegram()

	const impactOccurred = (style: ImpactStyle = 'light', fallbackMs: number = 50) => {
		if (
			webApp
			&& webApp.HapticFeedback
			&& typeof webApp.HapticFeedback.impactOccurred === 'function'
		) {
			webApp.HapticFeedback.impactOccurred(style)
			return
		}

		if ('vibrate' in navigator) {
			navigator.vibrate(fallbackMs)
		}
	}

	return { impactOccurred }
}

export default useHapticFeedback
