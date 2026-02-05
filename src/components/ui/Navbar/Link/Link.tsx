import type { AnchorHTMLAttributes, FC } from 'react'

import Icon from '@/ui/Icon/Icon.tsx'
import { useHapticFeedback } from '@/hooks/useHapticFeedback'

import cn from 'classnames'
import { Link as RouterLink, useMatch } from 'react-router'

import styles from './Link.module.scss'

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
	icon: string
	to: string
}

const Link: FC<LinkProps> = ({ className, icon, to, onClick, ...props }) => {
	const match = useMatch(to)
	const { impactOccurred } = useHapticFeedback()

	const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
		impactOccurred('medium')

		if (onClick) {
			onClick(e)
		}
	}

	return (
		<RouterLink
			className={cn(styles.link, to !== '' && match && styles.active, className)}
			to={to}
			onClick={handleClick}
			{...props}
		>
			<Icon className={styles.icon} name={icon} width={20} height={20} />
		</RouterLink>
	)
}

export default Link
