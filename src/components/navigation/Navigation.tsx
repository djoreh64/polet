import type { FC } from 'react'

import Layout from '@/navigation/Layout/Layout.tsx'

import Collection from '@/screens/Collection/Collection'
import Donate from '@/screens/Donate/Donate.tsx'
import Earn from '@/screens/Earn/Earn'
import Gift from '@/screens/Gift/Gift.tsx'
import GiftDeposit from '@/screens/GiftDeposit/GiftDeposit'
import Home from '@/screens/Home/Home'
import Onboarding from '@/screens/Home/Onboarding/Onboarding'
import Leaderboard from '@/screens/Leaderboard/Leaderboard'
import RoulettePage from '@/screens/Roulette/RoulettePage'
import { AnimatePresence } from 'motion/react'
import { Route, BrowserRouter as Router, Routes } from 'react-router'
import BalanceScreen from '@/screens/balanceScreen/BalanceScreen'
import PlaneGameFirstPage from '@/screens/PlaneGameFirstPage/PlaneGameFirstPage'
import PlaneGame from '@/screens/PlaneGame/PlaneGame'
import { RewardScreen } from '@/screens/rewardScreen/RewardScreen'
import FreeCases from '@/screens/FreeCases/FreeCases'

const Navigation: FC = () => {
	return (
		<>
			<AnimatePresence>
				<Router>
					<Routes>
						<Route path="/preview" element={<Onboarding />} />
						<Route path="/deposit" element={<BalanceScreen />} />
						<Route element={<Layout />}>
							<Route path="/plane-game-first-page" element={<PlaneGameFirstPage />} />
							<Route path="/plane-game" element={<PlaneGame />} />
							<Route path="/" element={<Home />} />
							<Route path="/:giftId" element={<Gift />} />
							<Route path="/collection" element={<Collection />} />
							<Route path="/collection/:giftId" element={<Gift />} />
							<Route path="/earn" element={<Earn />} />
							<Route path="/leaderboard" element={<Leaderboard />} />
							<Route path="/free-cases" element={<FreeCases />} />
							<Route path="/roulette" element={<RoulettePage />} />
							<Route path="/gift-deposit" element={<GiftDeposit />} />
						</Route>
						<Route path="/reward/:giftId" element={<RewardScreen />} />
						<Route path="/donate" element={<Donate />} />
					</Routes>
				</Router>
			</AnimatePresence>
		</>
	)
}

export default Navigation
