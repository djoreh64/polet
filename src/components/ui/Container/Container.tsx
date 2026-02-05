import type { FC, HTMLAttributes } from 'react'
import cn from 'classnames'

import styles from './Container.module.scss'

const Container: FC<HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
	return (
		<div className={cn(styles.container, className)} {...props}>
			{children}
		</div>
	)
}

export default Container
