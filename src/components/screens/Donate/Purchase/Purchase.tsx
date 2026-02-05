/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */
import type { FC } from 'react'

import { useDustToStarsMutation, useDustToTonMutation } from '@/api/calculator.api.ts'
import { useDonateStarsMutation } from '@/api/donate.api.ts'

import TgStarIcon from '@/assets/icons/iconTgstars.svg?react'
import TonIcon from '@/assets/icons/iconTon.svg?react'
import useTelegram from '@/hooks/useTelegram.ts'
import useTranslation from '@/hooks/useTranslation.ts'
import OptionCard from '@/screens/Donate/Purchase/OptionCard/OptionCard.tsx'
import Button from '@/ui/Button/Button.tsx'

import Container from '@/ui/Container/Container.tsx'

import { useEffect, useState } from 'react'
import styles from './Purchase.module.scss'

const options: number[] = [1, 5, 10, 25, 50, 100]

type Currency = 'ton' | 'stars'

const Purchase: FC = () => {
	const { t } = useTranslation()

	const { webApp } = useTelegram()

	const [currency, setCurrency] = useState<Currency>('stars')
	const [amount, setAmount] = useState<number | ''>('')
	const [convertedAmount, setConvertedAmount] = useState<number>(0)
	const [optionPrices, setOptionPrices] = useState<number[]>([0, 0, 0])

	const [convertToStars] = useDustToStarsMutation()
	const [convertToTon] = useDustToTonMutation()
	const [donateStars, { data: donateStarsData, isSuccess: isDonateStarsSuccess }] = useDonateStarsMutation()

	useEffect(() => {
		if (amount === '' || amount <= 0) {
			setConvertedAmount(0)
			return
		}
		const fn = currency === 'stars' ? convertToStars : convertToTon
		fn({ amount })
			.unwrap()
			.then(res => setConvertedAmount(res.output_amount))
	}, [amount, currency, convertToStars, convertToTon])

	useEffect(() => {
		const fn = currency === 'stars' ? convertToStars : convertToTon
		Promise.all(options.map(opt => fn({ amount: opt }).unwrap()))
			.then(results => setOptionPrices(results.map(r => r.output_amount)))
	}, [currency, convertToStars, convertToTon])

	const handleCardSelect = (value: number) => setAmount(value)

	const handlePay = async () => {
		if (currency === 'stars') {
			await donateStars({ amount: Number(amount) })

			if (isDonateStarsSuccess) {
				webApp.openInvoice(donateStarsData?.invoice_url, () => {})
			}
		}
	}

	return (
		<section className={styles.purchase}>
			<Container>
				<div className={styles.buy}>
					<label className={styles.field}>
						<TonIcon className={styles.icon} width={20} height={20} />
						<input
							className={styles.input}
							name="coins"
							placeholder="coins"
							type="number"
							value={amount}
							onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
						/>
						{
							currency === 'stars'
								? (
										<Button className={styles.switcher} onClick={() => setCurrency('ton')}>
											<TonIcon width={20} height={20} />
											<span>Ton</span>
										</Button>
									)
								: (
										<Button className={styles.switcher} onClick={() => setCurrency('stars')}>
											<TgStarIcon width={20} height={20} />
											<span>Stars</span>
										</Button>
									)
						}
					</label>
					<Button className={styles.button} primary onClick={handlePay}>
						<span>{t('donate.button')}</span>
						<div className={styles.label}>
							<span>{convertedAmount}</span>
							{currency === 'ton' ? <TonIcon width={16} height={16} /> : <TgStarIcon width={16} height={16} />}
						</div>
					</Button>
				</div>

				<div className={styles.options}>
					{options.map((purchasedAmount, idx) => (
						<div
							className={styles.option}
							onClick={() => handleCardSelect(purchasedAmount)}
							key={purchasedAmount}
						>
							<OptionCard
								paymentCurrency={currency}
								purchasedAmount={purchasedAmount}
								paymentAmount={optionPrices[idx]}
							/>
						</div>
					))}
				</div>
			</Container>
		</section>
	)
}

export default Purchase
