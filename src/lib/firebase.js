const DEFAULT_DATABASE_URL = 'https://budget-f1d3e-default-rtdb.firebaseio.com'

export const DATABASE_URL = (
  import.meta.env.VITE_FIREBASE_DATABASE_URL || DEFAULT_DATABASE_URL
).replace(/\/$/, '')

const BUDGET_URL = `${DATABASE_URL}/budget.json`

export async function loadBudget() {
  const response = await fetch(BUDGET_URL)
  if (!response.ok) {
    throw new Error(`Failed to load budget (${response.status})`)
  }
  return response.json()
}

export async function saveBudget(data) {
  const response = await fetch(BUDGET_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error(`Failed to save budget (${response.status})`)
  }
}

export function subscribeBudget(onData, onError) {
  const source = new EventSource(BUDGET_URL)

  function handlePut(event) {
    try {
      const payload = JSON.parse(event.data)
      if (payload.path !== '/' && payload.path !== '') return
      onData(payload.data ?? null)
    } catch (error) {
      onError?.(error)
    }
  }

  source.addEventListener('put', handlePut)
  source.onerror = () => {
    onError?.(new Error('Lost database connection'))
  }

  return () => {
    source.removeEventListener('put', handlePut)
    source.close()
  }
}
