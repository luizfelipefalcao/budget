import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { currentYearMonth, nextYearMonth } from '../lib/money'

const FIRST_MONTH = currentYearMonth()

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
      months: [FIRST_MONTH],
      activeMonth: FIRST_MONTH,
      expenseTableTitle: 'Monthly Budget',
      expenseLabels: {},
      incomeLabels: {},
      customCategoryIds: [],
      customIncomeIds: [],
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

      saveExpenseEdits: (month, title, estimates, labels, incomeLabels = {}) =>
        set((state) => {
          const current = monthEntry(state.actuals, month)
          return {
            expenseTableTitle: title.trim() || 'Monthly Budget',
            expenseLabels: { ...state.expenseLabels, ...labels },
            incomeLabels: { ...state.incomeLabels, ...incomeLabels },
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

      addIncomeItem: () => {
        const id = `income-${Date.now()}`
        set((state) => ({
          customIncomeIds: [...(state.customIncomeIds ?? []), id],
          incomeLabels: {
            ...state.incomeLabels,
            [id]: 'New income',
          },
        }))
        return id
      },

      removeIncomeItem: (id) =>
        set((state) => ({
          customIncomeIds: (state.customIncomeIds ?? []).filter(
            (itemId) => itemId !== id,
          ),
        })),

      addMonth: () => {
        const { months } = get()
        if (months.length === 0) {
          const first = currentYearMonth()
          set({ months: [first], activeMonth: first })
          return
        }
        const next = nextYearMonth(months[months.length - 1])
        if (months.includes(next)) return
        set({ months: [...months, next], activeMonth: next })
      },
    }),
    {
      name: 'budget-storage',
      version: 2,
      migrate: () => {
        const month = currentYearMonth()
        return {
          months: [month],
          activeMonth: month,
          expenseTableTitle: 'Monthly Budget',
          expenseLabels: {},
          incomeLabels: {},
          customCategoryIds: [],
          customIncomeIds: [],
          removedCategoryIds: [],
          actuals: {},
        }
      },
    },
  ),
)
