import { useEffect, useState } from 'react'
import type { FC } from 'react'
import styles from './previewmodal.module.scss'
import Cancel from '@/assets/icons/cancel.svg?react'
import Button from '../Button/Button'
import useTranslation from '@/hooks/useTranslation'
import UseTelegram from '@/hooks/useTelegram'
import type { RootState } from '@/store/store'
import { useDispatch, useSelector } from 'react-redux'
import { setIsShowPreviewModal } from '@/store/ui/uiSlice'
import { useGetInfoQuery } from '@/store/api/profile.api'
import banner from '@/assets/backgrounds/super-banner.png'

export const PreviewModal: FC = () => {
	const { t } = useTranslation()
	const [loaded, setLoaded] = useState(false)

	const isShowPreviewModal = useSelector((state: RootState) => state.ui.isShowPreviewModal)
	const isOnboarding = useSelector((state: RootState) => state.ui.isOnboarding)
	const dispatch = useDispatch()

	const { data: infoData } = useGetInfoQuery()

	const { webApp } = UseTelegram()

	const handleClick = () => {
		webApp.openTelegramLink('https://t.me/chance_io')
	}

	const handleClose = () => {
		sessionStorage.setItem('hasSeenPreviewModal', 'true')
		dispatch(setIsShowPreviewModal(false))
	}

	useEffect(() => {
		if (isOnboarding) {
			sessionStorage.setItem('hasSeenPreviewModal', 'true')
			dispatch(setIsShowPreviewModal(false))
		}

		if (infoData && infoData.is_subscribed_channel === false && sessionStorage.getItem('hasSeenPreviewModal') !== 'true') {
			const timeout = setTimeout(() => {
				dispatch(setIsShowPreviewModal(true))
			}, 1200)

			return () => clearTimeout(timeout)
		}
	}, [infoData, isShowPreviewModal, dispatch, isOnboarding])

	if (!loaded && isShowPreviewModal) {
		return (
			<img
				src={banner}
				alt="preview"
				className={styles.bg}
				style={{
					width: '100%',
					objectFit: 'cover',
					opacity: 0,
					pointerEvents: 'none',
					display: loaded ? 'block' : 'none',
				}}
				onLoad={() => setLoaded(true)}
			/>
		)
	}

	if (isShowPreviewModal && loaded) {
		return (
			<div className={styles.sup_container}>
				<div className={styles.overlay} onClick={handleClose}>
				</div>
				<div className={styles.container}>
					<div className={styles.content}>
						<div className={styles.preview_content}>
							<img
								src={banner}
								alt="preview"
								className={styles.bg}
								style={{
									width: '100%',
									objectFit: 'cover',
									display: loaded ? 'block' : 'none',
								}}
								onLoad={() => setLoaded(true)}
							/>

							<div className={styles.cancel_container}>
								<div className={styles.cancel}>
									<Cancel onClick={handleClose} />
								</div>
							</div>
						</div>

						<div className={styles.info_block}>
							<h3>
								{t('banner.title')}
								<span className={styles.radial_text}>
									{' '}
									{t('banner.channel')}
								</span>
							</h3>
							<p className={styles.info_text}>{t('banner.text')}</p>
							<div className={styles.button_container}>
								<Button className={styles.button} primary onClick={handleClick}>{t('banner.subscribe')}</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (!isShowPreviewModal || !infoData)
		return null
}
