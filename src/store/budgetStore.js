import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nextYearMonth } from '../lib/money'

const DEFAULT_MONTHS = ['2026-05', '2026-06', '2026-07', '2026-08']

function monthEntry(actuals, month) {
  const current = actuals[month] ?? {}
  return {
    expenses: current.expenses ?? {},
    income: current.income ?? {},
    expenseEstimates: current.expenseEstimates ?? {},
    incomeEstimates: current.incomeEstimates ?? {},
  }
}

export const useBudgetStore = create(
  persist(
    (set, get) => ({
      months: DEFAULT_MONTHS,
      activeMonth: '2026-08',
      actuals: {},

      setActiveMonth: (month) => set({ activeMonth: month }),

      setExpenseActual: (month, categoryId, value) =>
        set((state) => {
          const current = monthEntry(state.actuals, month)
          return {
            actuals: {
              ...state.actuals,
              [month]: {
                ...current,
                expenses: {
                  ...current.expenses,
                  [categoryId]: value,
                },
              },
            },
          }
        }),

      setIncomeActual: (month, sourceId, value) =>
        set((state) => {
          const current = monthEntry(state.actuals, month)
          return {
            actuals: {
              ...state.actuals,
              [month]: {
                ...current,
                income: {
                  ...current.income,
                  [sourceId]: value,
                },
              },
            },
          }
        }),

      setExpenseEstimate: (month, categoryId, value) =>
        set((state) => {
          const current = monthEntry(state.actuals, month)
          return {
            actuals: {
              ...state.actuals,
              [month]: {
                ...current,
                expenseEstimates: {
                  ...current.expenseEstimates,
                  [categoryId]: value,
                },
              },
            },
          }
        }),

      setIncomeEstimate: (month, sourceId, value) =>
        set((state) => {
          const current = monthEntry(state.actuals, month)
          return {
            actuals: {
              ...state.actuals,
              [month]: {
                ...current,
                incomeEstimates: {
                  ...current.incomeEstimates,
                  [sourceId]: value,
                },
              },
            },
          }
        }),

      addMonth: () => {
        const { months } = get()
        const next = nextYearMonth(months[months.length - 1])
        if (months.includes(next)) return
        set({ months: [...months, next], activeMonth: next })
      },
    }),
    { name: 'budget-storage' },
  ),
)
