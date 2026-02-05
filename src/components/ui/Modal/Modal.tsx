import type { FC, MouseEvent, ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import cn from 'classnames'

import styles from './Modal.module.scss'
import { useDispatch, useSelector } from 'react-redux'
import { closeModal } from '@/store/modal/modalSlice'
import type { RootState } from '@/store/store'
import { createPortal } from 'react-dom'

const backgroundAnimation = {
	initial: {
		opacity: 0,
	},
	enter: {
		opacity: 1,
	},
}

const backgroundTransition = {
	duration: 0.4,
	ease: 'easeInOut',
}

const modalAnimation = {
	initial: {
		y: '100%',
	},
	enter: {
		y: 0,
	},
}

const modalTransition = {
	duration: 0.3,
	ease: 'easeInOut',
}

export type ModalType = 'confirmation' | 'info' | 'error' | 'balanceScreen'

export interface ModalProps {
	type: ModalType
	children: ReactNode
}

const Modal: FC<ModalProps> = ({ type, children }) => {
	const dispatch = useDispatch()

	const isOpen = useSelector((state: RootState) => state.modal.isOpen)

	const handleOverlayClick = (event: MouseEvent<HTMLDivElement>): void => {
		if (event.target === event.currentTarget) {
			dispatch(closeModal())
		}
	}

	return createPortal (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					className={styles.overlay}
					initial="initial"
					animate="enter"
					exit="initial"
					variants={backgroundAnimation}
					transition={backgroundTransition}
					onClick={handleOverlayClick}
				>
					<motion.div
						className={cn(styles.modal, styles[type])}
						initial="initial"
						animate="enter"
						exit="initial"
						variants={modalAnimation}
						transition={modalTransition}
					>
						{children}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body,
	)
}

export default Modal
