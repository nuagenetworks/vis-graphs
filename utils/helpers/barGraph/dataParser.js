
import { nest, nestStack, nestMinMaxSum, limit } from '../../helpers'

export default ({
  data,
  dimension,
  metric,
  stack,
  otherOptions,
  stackSequence = null,
  isSort
    }) => {
      
  return nestStack({
    data: limit({
      data: nestMinMaxSum({
        data: nest({
          data,
          key: dimension,
          sortColumn: stack,
          sequence: stackSequence,
          isSort
        }),
        stackColumn: metric
      }),
      limitOption: Object.assign({
        fields: [
          {
            type: 'array',
            name: 'values',
            groups: [stack],
            metrics: metric
          }
        ]
      }
        , otherOptions || {}
      ),
      isSort
    }),
    stackColumn: metric
  })

}
