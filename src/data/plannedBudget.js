function labeledItem(id, labels, fallbackLabel, planned = 0) {
  const custom = labels[id]
  return {
    id,
    label:
      custom != null && String(custom).trim() !== '' ? custom : fallbackLabel,
    planned,
  }
}

export const expenseCategories = [
  { id: 'rent', label: 'Rent', planned: 0 },
  { id: 'bc-hydro', label: 'BC Hydro', planned: 0 },
  { id: 'utilities-td', label: 'Utilities (TD)', planned: 0 },
  { id: 'entertainment-td', label: 'Entertainment (TD)', planned: 0 },
  { id: 'grocery-td', label: 'Grocery (TD)', planned: 0 },
  { id: 'extra-td', label: 'Extra (TD)', planned: 0 },
  { id: 'transport-td', label: 'Transport (TD)', planned: 0 },
  { id: 'boundary-bay-td', label: 'Boundary Bay (TD)', planned: 0 },
  { id: 'nina', label: 'Nina', planned: 0 },
  { id: 'card-jess', label: 'Card Jess', planned: 0 },
  { id: 'card-felipe', label: 'Card Felipe', planned: 0 },
  { id: 'mounjaro', label: 'Mounjaro', planned: 0 },
  { id: 'brasil', label: 'Brasil', planned: 0 },
  { id: 'car-loan-insurance', label: 'Car Loan + Insurance', planned: 0 },
]

export const incomeSources = [
  { id: 'felipe', label: 'Felipe', planned: 0 },
  { id: 'jessica', label: 'Jessica', planned: 0 },
]

export const defaultIncomeAmounts = {
  felipe: '6030',
  jessica: '4666',
}

export function buildExpenseItems(
  customIds = [],
  labels = {},
  removedIds = [],
) {
  const removed = new Set(removedIds)
  const builtInIds = new Set(expenseCategories.map((item) => item.id))
  const customItems = customIds
    .filter((id) => !removed.has(id) && !builtInIds.has(id))
    .map((id) => labeledItem(id, labels, 'New expense'))

  return [...expenseCategories, ...customItems]
    .filter((item) => !removed.has(item.id))
    .map((item) => labeledItem(item.id, labels, item.label, item.planned))
}

export function buildIncomeItems(customIds = [], labels = {}, removedIds = []) {
  const removed = new Set(removedIds)
  const builtInIds = new Set(incomeSources.map((item) => item.id))
  const customItems = customIds
    .filter((id) => !removed.has(id) && !builtInIds.has(id))
    .map((id) => labeledItem(id, labels, 'New income'))

  return [...incomeSources, ...customItems]
    .filter((item) => !removed.has(item.id))
    .map((item) => labeledItem(item.id, labels, item.label, item.planned))
}

export function buildSavingsItems(customIds = [], labels = {}) {
  return customIds.map((id) => labeledItem(id, labels, 'New saving'))
}
