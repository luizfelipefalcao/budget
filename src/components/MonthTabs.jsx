import { useState } from 'react'
import BudgetTable from './BudgetTable'
import {
  buildExpenseItems,
  buildIncomeItems,
  buildSavingsItems,
  LEFTOVER_SAVINGS_ID,
} from '../data/plannedBudget'
import {
  formatCurrency,
  leftoverBudget,
  monthHeading,
  parseAmount,
  resolveActual,
  resolveEstimate,
  tabLabel,
} from '../lib/money'
import { useBudgetStore } from '../store/budgetStore'

export default function MonthTabs() {
  const months = useBudgetStore((state) => state.months)
  const activeMonth = useBudgetStore((state) => state.activeMonth)
  const actuals = useBudgetStore((state) => state.actuals)
  const expenseTableTitle =
    useBudgetStore((state) => state.expenseTableTitle) || 'Monthly Budget'
  const savedLabels = useBudgetStore((state) => state.expenseLabels) ?? {}
  const savedIncomeLabels = useBudgetStore((state) => state.incomeLabels) ?? {}
  const savedSavingsLabels = useBudgetStore((state) => state.savingsLabels) ?? {}
  const customCategoryIds =
    useBudgetStore((state) => state.customCategoryIds) ?? []
  const customIncomeIds = useBudgetStore((state) => state.customIncomeIds) ?? []
  const customSavingsIds =
    useBudgetStore((state) => state.customSavingsIds) ?? []
  const removedCategoryIds =
    useBudgetStore((state) => state.removedCategoryIds) ?? []
  const setActiveMonth = useBudgetStore((state) => state.setActiveMonth)
  const setExpenseActual = useBudgetStore((state) => state.setExpenseActual)
  const setIncomeActual = useBudgetStore((state) => state.setIncomeActual)
  const setSavingsActual = useBudgetStore((state) => state.setSavingsActual)
  const saveExpenseEdits = useBudgetStore((state) => state.saveExpenseEdits)
  const addExpenseItem = useBudgetStore((state) => state.addExpenseItem)
  const removeExpenseItem = useBudgetStore((state) => state.removeExpenseItem)
  const addIncomeItem = useBudgetStore((state) => state.addIncomeItem)
  const removeIncomeItem = useBudgetStore((state) => state.removeIncomeItem)
  const addSavingsItem = useBudgetStore((state) => state.addSavingsItem)
  const removeSavingsItem = useBudgetStore((state) => state.removeSavingsItem)
  const addMonth = useBudgetStore((state) => state.addMonth)

  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftEstimates, setDraftEstimates] = useState({})
  const [draftLabels, setDraftLabels] = useState({})
  const [draftIncomeLabels, setDraftIncomeLabels] = useState({})
  const [draftSavingsLabels, setDraftSavingsLabels] = useState({})

  const monthActuals = actuals[activeMonth] ?? {}
  const expenseActuals = monthActuals.expenses ?? {}
  const incomeActuals = monthActuals.income ?? {}
  const savingsActuals = monthActuals.savings ?? {}
  const savedEstimates = monthActuals.expenseEstimates ?? {}
  const expenseEstimates = isEditing ? draftEstimates : savedEstimates
  const tableTitle = isEditing ? draftTitle : expenseTableTitle
  const labelSource = isEditing ? draftLabels : savedLabels
  const incomeLabelSource = isEditing ? draftIncomeLabels : savedIncomeLabels
  const savingsLabelSource = isEditing ? draftSavingsLabels : savedSavingsLabels
  const labeledCategories = buildExpenseItems(
    customCategoryIds,
    labelSource,
    removedCategoryIds,
  )
  const incomeItems = buildIncomeItems(customIncomeIds, incomeLabelSource)
  const savingsItems = buildSavingsItems(customSavingsIds, savingsLabelSource)

  const estimatedExpenseTotal = labeledCategories.reduce(
    (sum, item) =>
      sum + resolveEstimate(expenseEstimates[item.id], item.planned),
    0,
  )
  const actualExpenseTotal = labeledCategories.reduce(
    (sum, item) => sum + parseAmount(expenseActuals[item.id]),
    0,
  )
  const actualIncomeTotal = incomeItems.reduce(
    (sum, item) => sum + parseAmount(incomeActuals[item.id]),
    0,
  )
  const leftover = leftoverBudget(actualIncomeTotal, actualExpenseTotal)
  const suggestedSavings = { [LEFTOVER_SAVINGS_ID]: leftover }
  const overspent = actualExpenseTotal - estimatedExpenseTotal
  const savings = savingsItems.reduce(
    (sum, item) =>
      sum + resolveActual(savingsActuals[item.id], suggestedSavings[item.id]),
    0,
  )

  function startEdit() {
    setDraftTitle(expenseTableTitle)
    setDraftEstimates({ ...savedEstimates })
    setDraftLabels(
      Object.fromEntries(
        buildExpenseItems(
          customCategoryIds,
          savedLabels,
          removedCategoryIds,
        ).map((item) => [item.id, item.label]),
      ),
    )
    setDraftIncomeLabels(
      Object.fromEntries(
        buildIncomeItems(customIncomeIds, savedIncomeLabels).map((item) => [
          item.id,
          item.label,
        ]),
      ),
    )
    setDraftSavingsLabels(
      Object.fromEntries(
        buildSavingsItems(customSavingsIds, savedSavingsLabels).map((item) => [
          item.id,
          item.label,
        ]),
      ),
    )
    setIsEditing(true)
  }

  function saveEdits() {
    saveExpenseEdits(
      activeMonth,
      draftTitle,
      draftEstimates,
      draftLabels,
      draftIncomeLabels,
      draftSavingsLabels,
    )
    setIsEditing(false)
  }

  function handleRemoveColumn(categoryId) {
    removeExpenseItem(categoryId)
    setDraftLabels((current) => {
      const next = { ...current }
      delete next[categoryId]
      return next
    })
    setDraftEstimates((current) => {
      const next = { ...current }
      delete next[categoryId]
      return next
    })
  }

  function handleRemoveIncomeColumn(sourceId) {
    removeIncomeItem(sourceId)
    setDraftIncomeLabels((current) => {
      const next = { ...current }
      delete next[sourceId]
      return next
    })
  }

  function handleRemoveSavingsColumn(sourceId) {
    if (sourceId === LEFTOVER_SAVINGS_ID) return
    removeSavingsItem(sourceId)
    setDraftSavingsLabels((current) => {
      const next = { ...current }
      delete next[sourceId]
      return next
    })
  }

  function handleAddItem() {
    const id = addExpenseItem()
    if (isEditing) {
      setDraftLabels((current) => ({
        ...current,
        [id]: 'New expense',
      }))
      setDraftEstimates((current) => ({
        ...current,
        [id]: '',
      }))
    }
  }

  function handleAddIncomeItem() {
    const id = addIncomeItem()
    if (isEditing) {
      setDraftIncomeLabels((current) => ({
        ...current,
        [id]: 'New income',
      }))
    }
  }

  function handleAddSavingsItem() {
    const id = addSavingsItem()
    if (isEditing) {
      setDraftSavingsLabels((current) => ({
        ...current,
        [id]: 'New saving',
      }))
    }
  }

  function selectMonth(month) {
    setIsEditing(false)
    setActiveMonth(month)
  }

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
                onClick={() => selectMonth(month)}
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
        <div className="panel-header">
          <h1 className="month-heading">{monthHeading(activeMonth)}</h1>
          <div className="panel-summary">
            <div className="budget-summary">
              <div
                className={`summary-chip overspent ${overspent > 0 ? 'is-over' : overspent < 0 ? 'is-under' : ''}`}
              >
                <span className="summary-label">Overspent</span>
                <span className="summary-value">
                  {formatCurrency(overspent)}
                </span>
                <span className="summary-hint">
                  Actual expenses − estimate
                </span>
              </div>
              <div
                className={`summary-chip savings ${savings < 0 ? 'is-over' : savings > 0 ? 'is-under' : ''}`}
              >
                <span className="summary-label">Savings</span>
                <span className="summary-value">{formatCurrency(savings)}</span>
                <span className="summary-hint">Saving table total</span>
              </div>
            </div>
          </div>
        </div>

        <BudgetTable
          title={tableTitle}
          items={labeledCategories}
          actuals={expenseActuals}
          estimates={expenseEstimates}
          editing={isEditing}
          canEditTitle
          onChangeTitle={setDraftTitle}
          onChangeLabel={(categoryId, value) =>
            setDraftLabels((current) => ({
              ...current,
              [categoryId]: value,
            }))
          }
          onChangeActual={(categoryId, value) =>
            setExpenseActual(activeMonth, categoryId, value)
          }
          onChangeEstimate={(categoryId, value) =>
            setDraftEstimates((current) => ({
              ...current,
              [categoryId]: value,
            }))
          }
          onRemoveColumn={handleRemoveColumn}
        />

        <div className="edit-actions">
          <button type="button" className="add-item-btn" onClick={handleAddItem}>
            Add Item
          </button>
        </div>

        <BudgetTable
          title="Income"
          items={incomeItems}
          actuals={incomeActuals}
          compact
          singleRow
          editing={isEditing}
          onChangeLabel={(sourceId, value) =>
            setDraftIncomeLabels((current) => ({
              ...current,
              [sourceId]: value,
            }))
          }
          onChangeActual={(sourceId, value) =>
            setIncomeActual(activeMonth, sourceId, value)
          }
          onRemoveColumn={handleRemoveIncomeColumn}
        />

        <div className="edit-actions">
          <button
            type="button"
            className="add-item-btn"
            onClick={handleAddIncomeItem}
          >
            Add Item
          </button>
        </div>

        <BudgetTable
          title="Saving"
          items={savingsItems}
          actuals={savingsActuals}
          suggestedActuals={suggestedSavings}
          compact
          singleRow
          editing={isEditing}
          onChangeLabel={(sourceId, value) =>
            setDraftSavingsLabels((current) => ({
              ...current,
              [sourceId]: value,
            }))
          }
          onChangeActual={(sourceId, value) =>
            setSavingsActual(activeMonth, sourceId, value)
          }
          onRemoveColumn={handleRemoveSavingsColumn}
        />

        <div className="edit-actions">
          <button
            type="button"
            className="add-item-btn"
            onClick={handleAddSavingsItem}
          >
            Add Item
          </button>
        </div>

        <div className="edit-actions footer-actions">
          <button
            type="button"
            className="edit-btn"
            onClick={startEdit}
            disabled={isEditing}
          >
            Edit
          </button>
          <button
            type="button"
            className="save-btn"
            onClick={saveEdits}
            disabled={!isEditing}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
