import { useCallback, useEffect, useRef, useState } from 'react'

export function useTwaPopup() {
	const [isOpen, setIsOpen] = useState(true)
	const popupRef = useRef<HTMLDivElement>(null)

	const handleClick = useCallback((e: MouseEvent) => {
		if (!popupRef.current?.contains(e.target as Node)) {
			setIsOpen(false)
		}
	}, [])

	useEffect(() => {
		if (!isOpen)
			return

		document.addEventListener('click', handleClick)
		return () => document.removeEventListener('click', handleClick)
	}, [isOpen, handleClick])

	return { isOpen, setIsOpen, popupRef }
}
