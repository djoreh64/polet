import iconBot from '@/assets/icons/iconBot.png'
import UseTelegram from '@/hooks/useTelegram'
import { useDonateCryptoPayMutation } from '@/store/api/donate.api'
import Button from '@/ui/Button/Button'
import type { FC } from 'react'
import { useEffect } from 'react'
import styles from './CryptoPayButton.module.scss'

interface Props {
	amount: number | any
	setIsShowInfo: (arg: boolean) => void
	customClass?: string
	percent?: number
}

export const CryptoPayComponent: FC<Props> = ({ amount, percent, setIsShowInfo, customClass }) => {
	const [createInvoice, { data: invoice }] = useDonateCryptoPayMutation()

	const { webApp } = UseTelegram()

	const handleCreateInvoice = () => {
		if (amount >= 0.1) {
			createInvoice({
				amount,
			})
		}
		setIsShowInfo(true)
	}

	useEffect(() => {
		if (invoice) {
			webApp.openTelegramLink(invoice.invoice_url)
		}
	}, [invoice])

	return (

		<Button className={customClass || styles.button} onClick={handleCreateInvoice}>
			{(percent && percent > 1)
				? (
						<div className={styles.salePlank}>
							{percent.toFixed(0)}
							%
						</div>
					)
				: null}
			<img src={iconBot} alt="@send" width={16} height={16} />
			<div>
				@Send
				{' '}
				<span>(+3% Fee)</span>
			</div>
		</Button>

	)
}
