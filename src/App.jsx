import { useEffect, useState } from 'react'
import './App.css'
import AuthScreen from './components/AuthScreen'
import MonthTabs from './components/MonthTabs'
import { startBudgetSync } from './lib/budgetSync'

const SYNC_LABELS = {
  saving: 'Saving to database…',
  saved: 'Saved to database',
  offline: 'Saved on this device only',
}

function App() {
  const [unlocked, setUnlocked] = useState(
    () => localStorage.getItem('budget-unlocked') === '1',
  )
  const [syncStatus, setSyncStatus] = useState(null)

  useEffect(() => {
    if (!unlocked) return undefined
    return startBudgetSync(setSyncStatus)
  }, [unlocked])

  if (!unlocked) {
    return <AuthScreen onUnlock={() => setUnlocked(true)} />
  }

  return (
    <main className="home">
      <header className="page-header">
        <p className="brand">Budget</p>
        <p className="subtitle">
          Planned vs actual by month
          {syncStatus ? (
            <span className="sync-status"> · {SYNC_LABELS[syncStatus]}</span>
          ) : null}
        </p>
      </header>
      <MonthTabs />
    </main>
  )
}

export default App
