import TimeFormatter  from './Time';
import NumbersFormatter  from './Numbers';
import React from 'react'

const Formatter = (props) => {
    let {
        value,
        tickFormat,
        dateHistogram
    } = props;
    let parsedData = value;
    if(dateHistogram) {
      parsedData = TimeFormatter({tickFormat, value});
    }
    else {
      parsedData = NumbersFormatter({tickFormat, value});
    }
    return parsedData;
}
export default Formatter;