import {
  compareTone,
  formatCurrency,
  hasAmount,
  parseAmount,
  resolveEstimate,
} from '../lib/money'

export default function BudgetTable({
  title,
  items,
  actuals,
  estimates,
  onChangeActual,
  onChangeEstimate,
  invertColors = false,
  compact = false,
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

  return (
    <section className="budget-table-block">
      <h2>{title}</h2>
      <div className="table-scroll">
        <table className={compact ? 'budget-table compact' : 'budget-table'}>
          <thead>
            <tr>
              <th scope="col" className="row-label-col">
                <span className="visually-hidden">Row</span>
              </th>
              {items.map((item) => (
                <th key={item.id} scope="col">
                  {item.label}
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
              {items.map((item) => (
                <td key={item.id}>
                  <input
                    className="amount-input"
                    type="text"
                    inputMode="decimal"
                    aria-label={`${item.label} estimate`}
                    value={estimates[item.id] ?? item.planned}
                    onChange={(event) =>
                      onChangeEstimate(item.id, event.target.value)
                    }
                  />
                </td>
              ))}
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
                      type="text"
                      inputMode="decimal"
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
