import { useState } from 'react'

const APP_PASSWORD = 'BDGT26'

export default function AuthScreen({ onUnlock }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    if (password === APP_PASSWORD) {
      localStorage.setItem('budget-unlocked', '1')
      onUnlock()
      return
    }
    setError(true)
  }

  return (
    <main className="auth-screen">
      <header className="page-header">
        <p className="brand">Budget</p>
        <p className="subtitle">Enter the password to continue</p>
      </header>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-label" htmlFor="app-password">
          Password
        </label>
        <input
          id="app-password"
          className="auth-input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value)
            setError(false)
          }}
        />
        {error ? <p className="auth-error">That password does not match.</p> : null}
        <button type="submit" className="auth-submit">
          Continue
        </button>
      </form>
    </main>
  )
}
