
import { nest, nestStack, nestMinMaxSum, limit } from '../../helpers'

export default ({
  data,
  dimension,
  metric,
  stack,
  otherOptions,
  stackSequence = null
    }) => {

  return nestStack({
    data: limit({
      data: nestMinMaxSum({
        data: nest({
          data,
          key: dimension,
          sortColumn: stack,
          sequence: stackSequence
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
      )
    }),
    stackColumn: metric
  })

}
