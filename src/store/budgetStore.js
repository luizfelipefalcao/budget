import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { defaultIncomeAmounts } from '../data/plannedBudget'
import { currentYearMonth, nextYearMonth } from '../lib/money'

export const DATA_VERSION = 3
const FIRST_MONTH = currentYearMonth()

function monthEntry(actuals, month) {
  const current = actuals[month] ?? {}
  return {
    expenses: current.expenses ?? {},
    income: current.income ?? {},
    savings: current.savings ?? {},
    expenseEstimates: current.expenseEstimates ?? {},
    incomeEstimates: current.incomeEstimates ?? {},
  }
}

export function createInitialBudgetState() {
  return {
    dataVersion: DATA_VERSION,
    months: [FIRST_MONTH],
    activeMonth: FIRST_MONTH,
    expenseTableTitle: 'Monthly Budget',
    expenseLabels: {},
    incomeLabels: {
      felipe: 'Felipe',
      jessica: 'Jessica',
    },
    savingsLabels: {},
    customCategoryIds: [],
    customIncomeIds: [],
    customSavingsIds: [],
    removedCategoryIds: [],
    removedIncomeIds: [],
    actuals: {
      [FIRST_MONTH]: {
        expenses: {},
        income: { ...defaultIncomeAmounts },
        savings: {},
        expenseEstimates: {},
        incomeEstimates: {},
      },
    },
  }
}

export const useBudgetStore = create(
  persist(
    (set, get) => ({
      ...createInitialBudgetState(),

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

      setSavingsActual: (month, sourceId, value) =>
        set((state) => {
          const current = monthEntry(state.actuals, month)
          return {
            actuals: {
              ...state.actuals,
              [month]: {
                ...current,
                savings: {
                  ...current.savings,
                  [sourceId]: value,
                },
              },
            },
          }
        }),

      saveExpenseSection: (month, estimates, labels) =>
        set((state) => {
          const current = monthEntry(state.actuals, month)
          return {
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

      saveIncomeSection: (labels) =>
        set((state) => ({
          incomeLabels: { ...state.incomeLabels, ...labels },
        })),

      saveSavingsSection: (labels) =>
        set((state) => ({
          savingsLabels: { ...state.savingsLabels, ...labels },
        })),

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
        set((state) => {
          const customIds = state.customIncomeIds ?? []
          const isCustom = customIds.includes(id)
          return {
            customIncomeIds: isCustom
              ? customIds.filter((itemId) => itemId !== id)
              : customIds,
            removedIncomeIds: isCustom
              ? (state.removedIncomeIds ?? [])
              : [...new Set([...(state.removedIncomeIds ?? []), id])],
          }
        }),

      addSavingsItem: () => {
        const id = `saving-${Date.now()}`
        set((state) => ({
          customSavingsIds: [...(state.customSavingsIds ?? []), id],
          savingsLabels: {
            ...state.savingsLabels,
            [id]: 'New saving',
          },
        }))
        return id
      },

      removeSavingsItem: (id) =>
        set((state) => ({
          customSavingsIds: (state.customSavingsIds ?? []).filter(
            (itemId) => itemId !== id,
          ),
        })),

      addMonth: () => {
        const { months, actuals } = get()
        if (months.length === 0) {
          const first = currentYearMonth()
          set({ months: [first], activeMonth: first })
          return
        }
        const previous = months[months.length - 1]
        const next = nextYearMonth(previous)
        if (months.includes(next)) return
        const previousEntry = monthEntry(actuals, previous)
        set({
          months: [...months, next],
          activeMonth: next,
          actuals: {
            ...actuals,
            [next]: {
              ...monthEntry(actuals, next),
              income: { ...previousEntry.income },
            },
          },
        })
      },
    }),
    {
      name: 'budget-storage',
      version: DATA_VERSION,
      migrate: () => createInitialBudgetState(),
    },
  ),
)
