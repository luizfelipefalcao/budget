import { useState } from 'react'
import { hashesMatch, sha256Hex } from '../lib/auth'

const AUTH_HASH = import.meta.env.VITE_AUTH_HASH

export default function AuthScreen({ onUnlock }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setChecking(true)
    setError(false)

    try {
      const enteredHash = await sha256Hex(password)
      if (hashesMatch(enteredHash, AUTH_HASH)) {
        localStorage.setItem('budget-unlocked', '1')
        onUnlock()
        return
      }
    } catch {
      // Fall through to the error state.
    }

    setError(true)
    setChecking(false)
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
        <button type="submit" className="auth-submit" disabled={checking}>
          Continue
        </button>
      </form>
    </main>
  )
}
