/**
 * Nesting - Grouping of elements by key and sorting of inner values
 */

import { nest, ascending } from "d3";
import sorter from "../sorter";

export default ({
    data,
    key,
    sortColumn = null,
    sortOrder = null,
    sequence = null,
    isSort
  }) => {

  const keyList = isSort === false ? nest().key(function (d) { return d[key] }) 
  : nest().key(function (d) { return d[key] }).sortKeys(ascending);

  return keyList
    .sortValues(sortColumn && isSort !== false
      ? sorter({
        column: sortColumn,
        order: sortOrder,
        sequence: sequence || null
      })
      : null)
    .entries(data)
}
