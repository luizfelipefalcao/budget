export const expenseCategories = [
  { id: 'rent', label: 'Rent', planned: 2750 },
  { id: 'bc-hydro', label: 'BC Hydro', planned: 60 },
  { id: 'cartao-utilities', label: 'Utilities Card (TD)', planned: 0 },
  { id: 'grocery', label: 'Grocery (TD)', planned: 1100 },
  { id: 'lazer', label: 'Leisure (TD)', planned: 1500 },
  { id: 'cartao-felipe', label: 'Felipe Momentum Card', planned: 240 },
  { id: 'nina', label: 'Nina', planned: 120 },
  { id: 'extras', label: 'Extras / Emergency (TD)', planned: 300 },
  { id: 'brasil', label: 'Brazil', planned: 860 },
  { id: 'carro', label: 'Car', planned: 875 },
  { id: 'seguro-carro', label: 'Car Insurance + CC Fee', planned: 260 },
  { id: 'gasolina', label: 'Gas (TD)', planned: 100 },
  { id: 'compass', label: 'Compass (TD)', planned: 150 },
  { id: 'cartao-jess', label: 'Jess Card', planned: 30 },
  { id: 'mounjaro', label: 'Mounjaro', planned: 322 },
]

export function buildExpenseItems(
  customIds = [],
  labels = {},
  removedIds = [],
) {
  const removed = new Set(removedIds)
  const customItems = customIds
    .filter((id) => !removed.has(id))
    .map((id) => ({
      id,
      label: 'New expense',
      planned: 0,
    }))

  return [...expenseCategories, ...customItems]
    .filter((item) => !removed.has(item.id))
    .map((item) => ({
      ...item,
      label:
        labels[item.id] != null && String(labels[item.id]).trim() !== ''
          ? labels[item.id]
          : item.label,
    }))
}

export const incomeSources = [
  { id: 'jess', label: 'Paycheck Jess', planned: 4666 },
  { id: 'felipe', label: 'Paycheck Felipe', planned: 6038 },
]
