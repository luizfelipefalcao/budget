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
      expenseTableTitle: 'Monthly Budget',
      expenseLabels: {},
      customCategoryIds: [],
      removedCategoryIds: [],
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

      saveExpenseEdits: (month, title, estimates, labels) =>
        set((state) => {
          const current = monthEntry(state.actuals, month)
          return {
            expenseTableTitle: title.trim() || 'Monthly Budget',
            expenseLabels: { ...state.expenseLabels, ...labels },
            actuals: {
              ...state.actuals,
              [month]: {
                ...current,
                expenseEstimates: {
                  ...current.expenseEstimates,
                  ...estimates,
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

      addExpenseItem: () => {
        const id = `custom-${Date.now()}`
        set((state) => ({
          customCategoryIds: [...(state.customCategoryIds ?? []), id],
          expenseLabels: {
            ...state.expenseLabels,
            [id]: 'New expense',
          },
        }))
        return id
      },

      removeExpenseItem: (id) =>
        set((state) => {
          const customIds = state.customCategoryIds ?? []
          const isCustom = customIds.includes(id)
          return {
            customCategoryIds: isCustom
              ? customIds.filter((itemId) => itemId !== id)
              : customIds,
            removedCategoryIds: isCustom
              ? (state.removedCategoryIds ?? [])
              : [...new Set([...(state.removedCategoryIds ?? []), id])],
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
