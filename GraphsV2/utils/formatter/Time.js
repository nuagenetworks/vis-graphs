import {formatDate} from "vis-graphs/utils/DateTimeUtils"

export default (props) => {
    const {
        value,
        tickFormat,
    } = props;
    //if tickFormat uses % (for example "%m/%d %H:%M") use "p" as format string, else use tickFormat
    const format = tickFormat && !tickFormat.includes("%") ? tickFormat : "p";
    return formatDate(new Date(value), format);
}
