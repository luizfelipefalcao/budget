import './App.css'
import MonthTabs from './components/MonthTabs'

function App() {
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
