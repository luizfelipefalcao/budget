import BudgetTable from './BudgetTable'
import { expenseCategories, incomeSources } from '../data/plannedBudget'
import {
  formatCurrency,
  monthHeading,
  parseAmount,
  resolveEstimate,
  tabLabel,
} from '../lib/money'
import { useBudgetStore } from '../store/budgetStore'

export default function MonthTabs() {
  const months = useBudgetStore((state) => state.months)
  const activeMonth = useBudgetStore((state) => state.activeMonth)
  const actuals = useBudgetStore((state) => state.actuals)
  const setActiveMonth = useBudgetStore((state) => state.setActiveMonth)
  const setExpenseActual = useBudgetStore((state) => state.setExpenseActual)
  const setIncomeActual = useBudgetStore((state) => state.setIncomeActual)
  const setExpenseEstimate = useBudgetStore((state) => state.setExpenseEstimate)
  const setIncomeEstimate = useBudgetStore((state) => state.setIncomeEstimate)
  const addMonth = useBudgetStore((state) => state.addMonth)

  const monthActuals = actuals[activeMonth] ?? {}
  const expenseActuals = monthActuals.expenses ?? {}
  const incomeActuals = monthActuals.income ?? {}
  const expenseEstimates = monthActuals.expenseEstimates ?? {}
  const incomeEstimates = monthActuals.incomeEstimates ?? {}

  const estimatedExpenseTotal = expenseCategories.reduce(
    (sum, item) =>
      sum + resolveEstimate(expenseEstimates[item.id], item.planned),
    0,
  )
  const actualExpenseTotal = expenseCategories.reduce(
    (sum, item) => sum + parseAmount(expenseActuals[item.id]),
    0,
  )
  const actualIncomeTotal = incomeSources.reduce(
    (sum, item) => sum + parseAmount(incomeActuals[item.id]),
    0,
  )
  const overspent = actualExpenseTotal - estimatedExpenseTotal
  const savings = actualIncomeTotal - actualExpenseTotal

  return (
    <div className="month-tabs">
      <div className="tab-bar-row">
        <div className="tab-bar" role="tablist" aria-label="Months">
          {months.map((month) => {
            const selected = month === activeMonth
            return (
              <button
                key={month}
                type="button"
                role="tab"
                aria-selected={selected}
                className={selected ? 'tab active' : 'tab'}
                onClick={() => setActiveMonth(month)}
              >
                {tabLabel(month)}
              </button>
            )
          })}
        </div>
        <button type="button" className="add-month" onClick={addMonth}>
          Add month
        </button>
      </div>

      <div className="tab-panel" role="tabpanel">
        <h1 className="month-heading">{monthHeading(activeMonth)}</h1>

        <BudgetTable
          title="Monthly Budget"
          items={expenseCategories}
          actuals={expenseActuals}
          estimates={expenseEstimates}
          onChangeActual={(categoryId, value) =>
            setExpenseActual(activeMonth, categoryId, value)
          }
          onChangeEstimate={(categoryId, value) =>
            setExpenseEstimate(activeMonth, categoryId, value)
          }
        />

        <BudgetTable
          title="Income"
          items={incomeSources}
          actuals={incomeActuals}
          estimates={incomeEstimates}
          invertColors
          compact
          onChangeActual={(sourceId, value) =>
            setIncomeActual(activeMonth, sourceId, value)
          }
          onChangeEstimate={(sourceId, value) =>
            setIncomeEstimate(activeMonth, sourceId, value)
          }
        />

        <div className="budget-summary">
          <div
            className={`summary-chip overspent ${overspent > 0 ? 'is-over' : overspent < 0 ? 'is-under' : ''}`}
          >
            <span className="summary-label">Overspent</span>
            <span className="summary-value">{formatCurrency(overspent)}</span>
            <span className="summary-hint">Actual expenses − estimate</span>
          </div>
          <div
            className={`summary-chip savings ${savings < 0 ? 'is-over' : savings > 0 ? 'is-under' : ''}`}
          >
            <span className="summary-label">Savings</span>
            <span className="summary-value">{formatCurrency(savings)}</span>
            <span className="summary-hint">Income − expenses</span>
          </div>
        </div>
      </div>
    </div>
  )
}
