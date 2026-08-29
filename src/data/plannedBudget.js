function labeledItem(id, labels, fallbackLabel) {
  const custom = labels[id]
  return {
    id,
    label:
      custom != null && String(custom).trim() !== '' ? custom : fallbackLabel,
    planned: 0,
  }
}

export function buildExpenseItems(
  customIds = [],
  labels = {},
  removedIds = [],
) {
  const removed = new Set(removedIds)
  return customIds
    .filter((id) => !removed.has(id))
    .map((id) => labeledItem(id, labels, 'New expense'))
}

export function buildIncomeItems(customIds = [], labels = {}) {
  return customIds.map((id) => labeledItem(id, labels, 'New income'))
}

export const LEFTOVER_SAVINGS_ID = 'leftover'

export function buildSavingsItems(customIds = [], labels = {}) {
  return [
    { ...labeledItem(LEFTOVER_SAVINGS_ID, labels, 'Leftover'), locked: true },
    ...customIds
      .filter((id) => id !== LEFTOVER_SAVINGS_ID)
      .map((id) => labeledItem(id, labels, 'New saving')),
  ]
}
