import type { FC, ReactNode } from 'react'

import Container from '@/ui/Container/Container.tsx'

import cn from 'classnames'
import { useState } from 'react'

import styles from './Tabs.module.scss'

export interface TabItem {
	id: string
	label: string
	content: ReactNode
}

interface TabsProps {
	className?: string
	tabs: TabItem[]
	defaultTab?: string
	onChange?: (tabId: string) => void
}

const Tabs: FC<TabsProps> = ({ className, tabs, defaultTab, onChange }) => {
	const [activeTabId, setActiveTabId] = useState<string>(defaultTab || (tabs.length > 0 ? tabs[0].id : ''))

	const handleTabClick = (tabId: string) => {
		setActiveTabId(tabId)
		if (onChange) {
			onChange(tabId)
		}
	}

	const activeTab = tabs.find(tab => tab.id === activeTabId)

	return (
		<section className={cn(styles.tabs, className)}>
			<Container className={styles.container}>
				<div className={styles.head}>
					{tabs.map(tab => (
						<button
							className={cn(styles.button, tab.id === activeTabId && styles.active)}
							onClick={() => handleTabClick(tab.id)}
							type="button"
							key={tab.id}
						>
							{tab.label}
						</button>
					))}
				</div>
				{activeTab && activeTab.content}
			</Container>
		</section>
	)
}

export default Tabs
