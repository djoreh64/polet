import type { FC } from 'react'

import Header from '@/ui/Header/Header.tsx'
import Navbar from '@/ui/Navbar/Navbar.tsx'
import { Outlet, useLocation } from 'react-router'
import DepositModal from '@/screens/Donate/Modal/DepositModal'
import cn from 'classnames'

const Layout: FC = () => {
	const { pathname } = useLocation()
	return (
		<div className={cn('layout', pathname === '/plane-game-first-page' && 'layout--plane-game-first-page')}>
			<Header />
			<main>
				<Outlet />
			</main>
			<Navbar />
			<DepositModal />
		</div>
	)
}

export default Layout
