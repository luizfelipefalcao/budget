import { useState } from 'react'
import BudgetTable from './BudgetTable'
import {
  buildExpenseItems,
  buildIncomeItems,
  buildSavingsItems,
} from '../data/plannedBudget'
import { flushBudget } from '../lib/budgetSync'
import {
  formatCurrency,
  monthHeading,
  parseAmount,
  resolveCarriedIncome,
  resolveEstimate,
  runningSavingsTotal,
  tabLabel,
} from '../lib/money'
import { useBudgetStore } from '../store/budgetStore'

function SectionActions({ editing, onAdd, onEdit, onSave }) {
  return (
    <div className="edit-actions">
      <button type="button" className="add-item-btn" onClick={onAdd}>
        Add Item
      </button>
      <button
        type="button"
        className="edit-btn"
        onClick={onEdit}
        disabled={editing}
      >
        Edit
      </button>
      <button
        type="button"
        className="save-btn"
        onClick={onSave}
        disabled={!editing}
      >
        Save
      </button>
    </div>
  )
}

export default function MonthTabs() {
  const months = useBudgetStore((state) => state.months)
  const activeMonth = useBudgetStore((state) => state.activeMonth)
  const actuals = useBudgetStore((state) => state.actuals)
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
  const removedIncomeIds = useBudgetStore((state) => state.removedIncomeIds) ?? []
  const setActiveMonth = useBudgetStore((state) => state.setActiveMonth)
  const setExpenseActual = useBudgetStore((state) => state.setExpenseActual)
  const setIncomeActual = useBudgetStore((state) => state.setIncomeActual)
  const setSavingsActual = useBudgetStore((state) => state.setSavingsActual)
  const saveExpenseSection = useBudgetStore((state) => state.saveExpenseSection)
  const saveIncomeSection = useBudgetStore((state) => state.saveIncomeSection)
  const saveSavingsSection = useBudgetStore((state) => state.saveSavingsSection)
  const addExpenseItem = useBudgetStore((state) => state.addExpenseItem)
  const removeExpenseItem = useBudgetStore((state) => state.removeExpenseItem)
  const addIncomeItem = useBudgetStore((state) => state.addIncomeItem)
  const removeIncomeItem = useBudgetStore((state) => state.removeIncomeItem)
  const addSavingsItem = useBudgetStore((state) => state.addSavingsItem)
  const removeSavingsItem = useBudgetStore((state) => state.removeSavingsItem)
  const addMonth = useBudgetStore((state) => state.addMonth)

  const [editingSection, setEditingSection] = useState(null)
  const [draftEstimates, setDraftEstimates] = useState({})
  const [draftLabels, setDraftLabels] = useState({})
  const [draftIncomeLabels, setDraftIncomeLabels] = useState({})
  const [draftSavingsLabels, setDraftSavingsLabels] = useState({})

  const monthActuals = actuals[activeMonth] ?? {}
  const expenseActuals = monthActuals.expenses ?? {}
  const savedEstimates = monthActuals.expenseEstimates ?? {}
  const expenseEstimates =
    editingSection === 'expense' ? draftEstimates : savedEstimates
  const labelSource = editingSection === 'expense' ? draftLabels : savedLabels
  const incomeLabelSource =
    editingSection === 'income' ? draftIncomeLabels : savedIncomeLabels
  const savingsLabelSource =
    editingSection === 'savings' ? draftSavingsLabels : savedSavingsLabels
  const labeledCategories = buildExpenseItems(
    customCategoryIds,
    labelSource,
    removedCategoryIds,
  )
  const incomeItems = buildIncomeItems(
    customIncomeIds,
    incomeLabelSource,
    removedIncomeIds,
  )
  const savingsItems = buildSavingsItems(customSavingsIds, savingsLabelSource)
  const incomeDisplay = Object.fromEntries(
    incomeItems.map((item) => [
      item.id,
      resolveCarriedIncome(actuals, months, activeMonth, item.id),
    ]),
  )

  const estimatedExpenseTotal = labeledCategories.reduce(
    (sum, item) =>
      sum + resolveEstimate(expenseEstimates[item.id], item.planned),
    0,
  )
  const actualExpenseTotal = labeledCategories.reduce(
    (sum, item) => sum + parseAmount(expenseActuals[item.id]),
    0,
  )
  const overspent = actualExpenseTotal - estimatedExpenseTotal
  const savings = runningSavingsTotal(
    actuals,
    months,
    activeMonth,
    savingsItems,
  )

  async function persistNow() {
    try {
      await flushBudget()
    } catch {
      // Status is handled by the live sync subscription.
    }
  }

  function startExpenseEdit() {
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
    setEditingSection('expense')
  }

  function startIncomeEdit() {
    setDraftIncomeLabels(
      Object.fromEntries(
        buildIncomeItems(
          customIncomeIds,
          savedIncomeLabels,
          removedIncomeIds,
        ).map((item) => [item.id, item.label]),
      ),
    )
    setEditingSection('income')
  }

  function startSavingsEdit() {
    setDraftSavingsLabels(
      Object.fromEntries(
        buildSavingsItems(customSavingsIds, savedSavingsLabels).map((item) => [
          item.id,
          item.label,
        ]),
      ),
    )
    setEditingSection('savings')
  }

  async function saveExpenseEdits() {
    saveExpenseSection(activeMonth, draftEstimates, draftLabels)
    setEditingSection(null)
    await persistNow()
  }

  async function saveIncomeEdits() {
    saveIncomeSection(draftIncomeLabels)
    setEditingSection(null)
    await persistNow()
  }

  async function saveSavingsEdits() {
    saveSavingsSection(draftSavingsLabels)
    setEditingSection(null)
    await persistNow()
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
    removeSavingsItem(sourceId)
    setDraftSavingsLabels((current) => {
      const next = { ...current }
      delete next[sourceId]
      return next
    })
  }

  async function handleAddExpenseItem() {
    const id = addExpenseItem()
    if (editingSection !== 'expense') startExpenseEdit()
    setDraftLabels((current) => ({
      ...current,
      [id]: 'New expense',
    }))
    setDraftEstimates((current) => ({
      ...current,
      [id]: '0',
    }))
    await persistNow()
  }

  async function handleAddIncomeItem() {
    const id = addIncomeItem()
    if (editingSection !== 'income') startIncomeEdit()
    setDraftIncomeLabels((current) => ({
      ...current,
      [id]: 'New income',
    }))
    await persistNow()
  }

  async function handleAddSavingsItem() {
    const id = addSavingsItem()
    if (editingSection !== 'savings') startSavingsEdit()
    setDraftSavingsLabels((current) => ({
      ...current,
      [id]: 'New saving',
    }))
    await persistNow()
  }

  function selectMonth(month) {
    setEditingSection(null)
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
                <span className="summary-hint">
                  Running total through this month
                </span>
              </div>
            </div>
          </div>
        </div>

        <BudgetTable
          title="Monthly Budget"
          items={labeledCategories}
          actuals={expenseActuals}
          estimates={expenseEstimates}
          editing={editingSection === 'expense'}
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

        <SectionActions
          editing={editingSection === 'expense'}
          onAdd={handleAddExpenseItem}
          onEdit={startExpenseEdit}
          onSave={saveExpenseEdits}
        />

        <BudgetTable
          title="Income"
          items={incomeItems}
          actuals={incomeDisplay}
          compact
          singleRow
          editing={editingSection === 'income'}
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

        <SectionActions
          editing={editingSection === 'income'}
          onAdd={handleAddIncomeItem}
          onEdit={startIncomeEdit}
          onSave={saveIncomeEdits}
        />

        <BudgetTable
          title="Saving"
          items={savingsItems}
          actuals={monthActuals.savings ?? {}}
          compact
          singleRow
          editing={editingSection === 'savings'}
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

        <SectionActions
          editing={editingSection === 'savings'}
          onAdd={handleAddSavingsItem}
          onEdit={startSavingsEdit}
          onSave={saveSavingsEdits}
        />
      </div>
    </div>
  )
}
