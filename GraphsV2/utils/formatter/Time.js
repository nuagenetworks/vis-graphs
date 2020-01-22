import React from 'react'
import moment from 'moment';

const Time = (props) => {
    let {
        value,
        tickFormat,
    } = props;
    const format = tickFormat || "LT";
    const parsed = moment(value).format(format);
    return  parsed;
}
export default Time;