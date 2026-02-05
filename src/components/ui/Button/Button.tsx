import cn from 'classnames'
import type { ButtonHTMLAttributes, FC } from 'react'

import styles from './Button.module.scss'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	primary?: boolean
	secondary?: boolean
	percent?: any
}

const Button: FC<ButtonProps> = ({ primary, secondary, className, children, percent, ...props }) => {
	return (
		<button className={cn(styles.button, primary && styles.primary, secondary && styles.secondary, className)} type="button"{...props}>
			{(percent && percent > 1)
				? (
						<div className={styles.salePlank}>
							{percent.toFixed(0)}
							%
						</div>
					)
				: null}
			{children}
		</button>
	)
}

export default Button
