import type { FC } from 'react'

import useTranslation from '@/hooks/useTranslation.ts'

import Container from '@/ui/Container/Container.tsx'

import PercentIcon from '@/assets/percent.png'
import styles from './Head.module.scss'

const Head: FC = () => {
	const { t } = useTranslation()

	return (
		<section className={styles.head}>
			<Container className={styles.container}>
				<div className={styles.imgWrapper}>
					<img src={PercentIcon} className={styles.img} alt="Referrals" />
				</div>
				<h1 className={styles.title}>{t('earn.referrals.title')}</h1>
				<p className={styles.text}>{t('earn.referrals.text')}</p>
			</Container>
		</section>
	)
}

export default Head
