import UseTelegram from '@/hooks/useTelegram'
import styles from './styles.module.scss'
import useTranslation from '@/hooks/useTranslation'
import CrystalLogo from '@/assets/icons/crystal-logo.svg?react'
import maintenance from '@/assets/wip.png'

export function MaintenancePage() {
	const { webApp } = UseTelegram()
	const { t } = useTranslation()
	return (
		<div className={styles.wrapper}>
			<div className={styles.header}>
				<CrystalLogo />
				<h1>Chance</h1>
			</div>
			<img src={maintenance} alt="maintenance" />
			<h3 className={styles.title}>
				<span className={styles.back}>{t('maintenance.title')}</span>
				{t('maintenance.title')}
				<span className={styles.front}>{t('maintenance.title')}</span>
			</h3>

			<button type="button" onClick={() => webApp.close()} className={styles.button}>{t('maintenance.button')}</button>
		</div>
	)
}
