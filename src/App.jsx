import { useState } from 'react'
import './App.css'
import AuthScreen from './components/AuthScreen'
import MonthTabs from './components/MonthTabs'

function App() {
  const [unlocked, setUnlocked] = useState(
    () => localStorage.getItem('budget-unlocked') === '1',
  )

  if (!unlocked) {
    return <AuthScreen onUnlock={() => setUnlocked(true)} />
  }

  return (
    <main className="home">
      <header className="page-header">
        <p className="brand">Budget</p>
        <p className="subtitle">Planned vs actual by month</p>
      </header>
      <MonthTabs />
    </main>
  )
}

export default App
