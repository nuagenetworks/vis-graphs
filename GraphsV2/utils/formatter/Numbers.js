import React from 'react'
import * as d3 from 'd3';

const Numbers = (props) => {
    let {
        value,
        tickFormat,
    } = props;

    if(tickFormat) {
      const format = d3.format(tickFormat);
      const parsed = format(value);
      return  parsed;
    }
    return value;
}
export default Numbers;
