import type { FC, SVGProps } from 'react'

interface IconProps extends SVGProps<SVGSVGElement> {
	name: string
}

const Icon: FC<IconProps> = ({ name, className, width, height, ...props }) => {
	return (
		<svg className={className} width={width} height={height} {...props}>
			<use href={`/img/icons.svg#${name}`} xlinkHref={`/img/icons.svg#${name}`} />
		</svg>
	)
}

export default Icon
