import { store } from '@/store/store.ts'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { createRoot } from 'react-dom/client'

import { Provider } from 'react-redux'

import '@/styles/global.scss'
import App from './App.tsx'

const root = document.getElementById('root')

createRoot(root!).render(
	<Provider store={store}>
		<TonConnectUIProvider manifestUrl="https://raw.githubusercontent.com/Zewsic/myCloud/refs/heads/main/tonconnect-manifest.json">
			<App />
		</TonConnectUIProvider>
	</Provider>,
)

if (import.meta.env.VITE_DEV) {
	// eruda.init()
}
