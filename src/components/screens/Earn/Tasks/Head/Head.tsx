import type { FC } from 'react'

import useTranslation from '@/hooks/useTranslation.ts'

import Container from '@/ui/Container/Container.tsx'

import TasksIcon from '@/assets/getFreeSpins.png'
import styles from './Head.module.scss'

const Head: FC = () => {
	const { t } = useTranslation()

	return (
		<section className={styles.head}>
			<Container className={styles.container}>
				<div className={styles.imgWrapper}>
					<img src={TasksIcon} className={styles.img} alt="Tasks" />
				</div>
				<h1 className={styles.title}>{t('earn.tasks.title')}</h1>
				<p className={styles.text}>{t('earn.tasks.text')}</p>
			</Container>
		</section>
	)
}

export default Head
