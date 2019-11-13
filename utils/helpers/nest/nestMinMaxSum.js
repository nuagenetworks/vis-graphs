/**
 * Stacking of Nested Groups and calculating of overall sum of negative and positive values respectively
 */
import { reducerSum } from "../reducers";

export default ({
    data,
  column = 'values',
  min = 'min',
  max = 'max',
  sumColumn = 'total',
  stackColumn
  }) => {

  return data.map((datum) => {
    let sumMin = 0, sumMax = 0

    datum[column].forEach((d, i) => {
      if (d[stackColumn] < 0) {
        sumMin -= -(d[stackColumn])
      } else {
        sumMax += +(d[stackColumn])
      }
    })

    return Object.assign({}, datum, {
      [min]: sumMin,
      [max]: sumMax,
      [sumColumn]: reducerSum({
        data: datum[column],
        column: stackColumn
      })
    }
    )
  })

}
