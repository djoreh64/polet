/* eslint-disable style/indent */
/* eslint-disable style/no-mixed-spaces-and-tabs */
import type { FC } from 'react'
import IconTonOutline from '@/assets/icons/iconTonOutline.svg?react'

import { cropAddress } from '@/utils/utils'
import {
	useTonAddress,
	useTonConnectUI,
	useTonWallet,
} from '@tonconnect/ui-react'
import { useEffect, useState } from 'react'

import Button from '../Button/Button'
import styles from './WalletConnect.module.scss'
import useTranslation from '@/hooks/useTranslation'

const WalletConnect: FC = () => {
  type BindStatus = 'idle' | 'loading' | 'success' | 'error'

  const { t } = useTranslation()

  const [bindStatus, setBindStatus] = useState<BindStatus>('idle')
  const [bindError, setBindError] = useState<string | null>(null)

  const [tonConnectUI] = useTonConnectUI()
  const userFriendlyAddress = useTonAddress()
  const wallet = useTonWallet()

  const handleConnectAndBind = async () => {
  	try {
  		setBindStatus('loading')
  		setBindError(null)

  		setBindStatus('success')
  	}
  	catch (err: any) {
  		setBindStatus('error')
  		setBindError(err.message)
  		console.error(err)
  	}
  }

  useEffect(() => {
  	if (userFriendlyAddress) {
  		handleConnectAndBind()
  	}
  }, [userFriendlyAddress])

  return (
  	<>
  		{userFriendlyAddress
  			? (
  					<button
	type="button"
	onClick={() => tonConnectUI.disconnect()}
	className={styles.badge}
  					>
  						{cropAddress(userFriendlyAddress)}
  					</button>
  				)
  			: (
  					<Button
	className={styles.button}
	onClick={() => tonConnectUI.openModal()}
  					>
  						<span>Connect</span>
  						<IconTonOutline width={16} height={16} />
  					</Button>
  				)}

  		{wallet && (
  			<>
  				{bindStatus === 'loading' && <p className={styles.info}>{t('walletConnect.binding')}</p>}

  				{bindStatus === 'success' && <p className={styles.info}>{t('walletConnect.success')}</p>}

  				{bindStatus === 'error' && (
  					<p className={styles.info} style={{ color: 'red' }}>
						{t('walletConnect.error')}
  						{' '}
  						{bindError}
  					</p>
  				)}
  			</>
  		)}
  	</>
  )
}

export default WalletConnect
