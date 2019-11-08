/**
 * Stacking of Nested Groups and calculating of overall sum
 */

import stack from "../stack";

export default ({
    data, 
    column = 'values',
    stackColumn
  }) => {

  return data.map((d) => {
    return Object.assign({}, d, {
        [column]: stack({
            data: d[column],
            column: stackColumn
        })
      }
    )
  })

}
