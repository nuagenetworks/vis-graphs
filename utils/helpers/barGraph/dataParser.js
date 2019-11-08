
import { limit } from '../../helpers/limit';
import { nest, nestStack, nestMinMaxSum } from '../../helpers/nest';

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
