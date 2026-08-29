import {
  compareTone,
  displayActual,
  formatCurrency,
  hasAmount,
  parseAmount,
  resolveActual,
  resolveEstimate,
} from '../lib/money'

function ColumnTitleEdit({ item, onChangeLabel, onRemoveColumn }) {
  return (
    <div className="column-title-edit">
      <input
        className="column-title-input"
        type="text"
        aria-label={`${item.label} column title`}
        value={item.label}
        onChange={(event) => onChangeLabel(item.id, event.target.value)}
      />
      {item.locked || !onRemoveColumn ? null : (
        <button
          type="button"
          className="column-delete"
          aria-label={`Remove ${item.label}`}
          onClick={() => onRemoveColumn(item.id)}
        >
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
            <path
              fill="currentColor"
              d="M6.2 1.5h3.6l.5 1H14v1.2H2V2.5h3.7l.5-1zM3.1 5h9.8l-.7 8.4c-.1.7-.7 1.2-1.4 1.2H5.2c-.7 0-1.3-.5-1.4-1.2L3.1 5zm2.6 1.4.3 6h-1.1l-.3-6h1.1zm3.3 0v6H8.9v-6h1.1z"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

export default function BudgetTable({
  title,
  items,
  actuals = {},
  estimates = {},
  onChangeActual,
  onChangeEstimate,
  invertColors = false,
  compact = false,
  singleRow = false,
  editing = false,
  canEditTitle = false,
  onChangeTitle,
  onChangeLabel,
  onRemoveColumn,
  suggestedActuals = {},
}) {
  const plannedValues = Object.fromEntries(
    items.map((item) => [
      item.id,
      resolveEstimate(estimates[item.id], item.planned),
    ]),
  )
  const plannedTotal = items.reduce(
    (sum, item) => sum + plannedValues[item.id],
    0,
  )
  const actualTotal = items.reduce(
    (sum, item) => sum + parseAmount(actuals[item.id]),
    0,
  )
  const differenceTotal = actualTotal - plannedTotal
  const enteredTotal = items.some((item) => hasAmount(actuals[item.id]))
    ? actualTotal
    : ''

  if (singleRow) {
    const incomeTotal = items.reduce(
      (sum, item) =>
        sum + resolveActual(actuals[item.id], suggestedActuals[item.id]),
      0,
    )

    return (
      <section className="budget-table-block">
        <h2>{title}</h2>
        <div className="table-scroll">
          <table className={compact ? 'budget-table compact' : 'budget-table'}>
            <thead>
              <tr>
                {items.map((item) => (
                  <th key={item.id} scope="col">
                    {editing ? (
                      <ColumnTitleEdit
                        item={item}
                        onChangeLabel={onChangeLabel}
                        onRemoveColumn={onRemoveColumn}
                      />
                    ) : (
                      item.label
                    )}
                  </th>
                ))}
                <th scope="col" className="total-col">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {items.map((item) => (
                  <td key={item.id}>
                    <input
                      className="amount-input"
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      aria-label={item.label}
                      min={item.locked ? undefined : '0'}
                      value={displayActual(
                        actuals[item.id],
                        suggestedActuals[item.id],
                      )}
                      onChange={(event) =>
                        onChangeActual(item.id, event.target.value)
                      }
                    />
                  </td>
                ))}
                <td className="total-col">{formatCurrency(incomeTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    )
  }

  return (
    <section className="budget-table-block">
      {canEditTitle && editing ? (
        <input
          className="title-input"
          type="text"
          aria-label="Monthly budget title"
          value={title}
          onChange={(event) => onChangeTitle(event.target.value)}
        />
      ) : (
        <h2>{title}</h2>
      )}
      <div className="table-scroll">
        <table className={compact ? 'budget-table compact' : 'budget-table'}>
          <thead>
            <tr>
              <th scope="col" className="row-label-col">
                <span className="visually-hidden">Row</span>
              </th>
              {items.map((item) => (
                <th key={item.id} scope="col">
                  {canEditTitle && editing ? (
                    <ColumnTitleEdit
                      item={item}
                      onChangeLabel={onChangeLabel}
                      onRemoveColumn={onRemoveColumn}
                    />
                  ) : (
                    item.label
                  )}
                </th>
              ))}
              <th scope="col" className="total-col">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Estimate</th>
              {items.map((item) =>
                editing ? (
                  <td key={item.id}>
                    <input
                      className="amount-input"
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      aria-label={`${item.label} estimate`}
                      value={estimates[item.id] ?? ''}
                      onChange={(event) =>
                        onChangeEstimate(item.id, event.target.value)
                      }
                    />
                  </td>
                ) : (
                  <td key={item.id}>
                    {formatCurrency(plannedValues[item.id])}
                  </td>
                ),
              )}
              <td className="total-col">{formatCurrency(plannedTotal)}</td>
            </tr>
            <tr>
              <th scope="row">Actual</th>
              {items.map((item) => {
                const planned = plannedValues[item.id]
                const tone = compareTone(actuals[item.id], planned, invertColors)
                return (
                  <td key={item.id} className={tone}>
                    <input
                      className="amount-input"
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      aria-label={`${item.label} actual`}
                      value={actuals[item.id] ?? ''}
                      onChange={(event) =>
                        onChangeActual(item.id, event.target.value)
                      }
                    />
                  </td>
                )
              })}
              <td
                className={`total-col ${compareTone(enteredTotal, plannedTotal, invertColors)}`}
              >
                {formatCurrency(actualTotal)}
              </td>
            </tr>
            <tr className="difference-row">
              <th scope="row">Difference</th>
              {items.map((item) => {
                const planned = plannedValues[item.id]
                const difference = parseAmount(actuals[item.id]) - planned
                const tone = compareTone(actuals[item.id], planned, invertColors)
                return (
                  <td key={item.id} className={tone}>
                    {formatCurrency(difference)}
                  </td>
                )
              })}
              <td
                className={`total-col ${compareTone(enteredTotal, plannedTotal, invertColors)}`}
              >
                {formatCurrency(differenceTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
