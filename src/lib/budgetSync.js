import { DATA_VERSION, useBudgetStore } from '../store/budgetStore'
import { saveBudget, loadBudget, subscribeBudget } from './firebase'

const DATA_KEYS = [
  'dataVersion',
  'months',
  'activeMonth',
  'expenseTableTitle',
  'expenseLabels',
  'incomeLabels',
  'savingsLabels',
  'customCategoryIds',
  'customIncomeIds',
  'customSavingsIds',
  'removedCategoryIds',
  'removedIncomeIds',
  'actuals',
]

export function pickBudgetData(state) {
  return JSON.parse(
    JSON.stringify(
      Object.fromEntries(DATA_KEYS.map((key) => [key, state[key]])),
    ),
  )
}

function normalizeBudget(data) {
  return {
    dataVersion: data.dataVersion ?? DATA_VERSION,
    months: data.months ?? [],
    activeMonth: data.activeMonth,
    expenseTableTitle: data.expenseTableTitle || 'Monthly Budget',
    expenseLabels: data.expenseLabels ?? {},
    incomeLabels: data.incomeLabels ?? {},
    savingsLabels: data.savingsLabels ?? {},
    customCategoryIds: data.customCategoryIds ?? [],
    customIncomeIds: data.customIncomeIds ?? [],
    customSavingsIds: data.customSavingsIds ?? [],
    removedCategoryIds: data.removedCategoryIds ?? [],
    removedIncomeIds: data.removedIncomeIds ?? [],
    actuals: data.actuals ?? {},
  }
}

function remoteIsCurrent(remote) {
  return (
    remote &&
    typeof remote === 'object' &&
    remote.dataVersion === DATA_VERSION &&
    remote.actuals &&
    typeof remote.actuals === 'object'
  )
}

function waitForHydration() {
  const persistApi = useBudgetStore.persist
  if (!persistApi || persistApi.hasHydrated()) {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    const unsub = persistApi.onFinishHydration(() => {
      unsub()
      resolve()
    })
  })
}

export async function flushBudget(onStatus) {
  onStatus?.('saving')
  await saveBudget(pickBudgetData(useBudgetStore.getState()))
  onStatus?.('saved')
}

export function startBudgetSync(onStatus) {
  let stopped = false
  let applyingRemote = false
  let writeTimer
  let unsubscribeStore
  let unsubscribeStream

  function applyRemote(data) {
    if (!data || typeof data !== 'object') return
    applyingRemote = true
    useBudgetStore.setState(normalizeBudget(data))
    applyingRemote = false
  }

  function queueSave(state) {
    if (applyingRemote || stopped) return
    onStatus?.('saving')
    clearTimeout(writeTimer)
    writeTimer = setTimeout(async () => {
      try {
        await saveBudget(pickBudgetData(state))
        if (!stopped) onStatus?.('saved')
      } catch {
        if (!stopped) onStatus?.('offline')
      }
    }, 500)
  }

  async function boot() {
    await waitForHydration()
    if (stopped) return

    try {
      const remote = await loadBudget()
      if (stopped) return
      if (remoteIsCurrent(remote)) {
        applyRemote(remote)
      } else {
        await saveBudget(pickBudgetData(useBudgetStore.getState()))
      }
      onStatus?.('saved')
    } catch {
      if (!stopped) onStatus?.('offline')
    }

    unsubscribeStore = useBudgetStore.subscribe(queueSave)
    unsubscribeStream = subscribeBudget((data) => {
      if (stopped || !remoteIsCurrent(data)) return
      applyRemote(data)
      onStatus?.('saved')
    })
  }

  boot()

  return () => {
    stopped = true
    clearTimeout(writeTimer)
    unsubscribeStore?.()
    unsubscribeStream?.()
  }
}
