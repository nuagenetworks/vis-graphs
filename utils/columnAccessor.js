import { format, timeFormat } from "d3";
import {addMillisecs, formatDate} from "vis-graphs/utils/DateTimeUtils";

const d3 = { format, timeFormat };

// Compute accessor functions that apply number and date formatters.
// Useful for presenting numbers in tables or tooltips.
const columnAccessor = ({ column, format, timeFormat, totalCharacters, duration }) => {

    // Generate the accessor for nested values (e.g. "foo.bar").
    const keys = column.split(".");
    const value = (d) => d[column] || keys.reduce((d, key) => {
        return typeof d === 'object' ? d[key] : d
    }, d);

    // Apply number and date formatters.
    if (format) {
        const formatter = d3.format(format)
        return (d) => {
            let data = value(d)
            if (Array.isArray(data)) {
                return data.map(e => formatter(e)).join(', ')
            } else {
                return data || data === 0 ? formatter(data) : ''
            }
        };
    } else if (timeFormat) {
        const formatter = d3.timeFormat(timeFormat);
        return (d) => {
            let data = Number(value(d));
            if (Array.isArray(data)) {
                return data.map(e => formatter(new Date(value(e)))).join(', ')
            } else {
                return formatter(new Date(data))
            }
        }
    } else if (totalCharacters) {
        return (d, showTooltip) => {
            let data = value(d)
            let parsedData = Array.isArray(data) ? data.map(e => e).join(', ') : data
            return showTooltip || !parsedData
                ? parsedData
                : (
                    typeof parsedData === 'string' && parsedData.length > totalCharacters
                        ? parsedData.substr(0, totalCharacters).concat('...')
                        : parsedData
                )
        }
    } else if (duration) {
        //convert d to Date in milliseconds with timezone offset, and format the same using duration string passed
        return (d) => formatDate(addMillisecs(new Date(new Date(0).getTimezoneOffset()*1000*60), value(d)), duration);
    } else {
        return value;
    }
};


export default columnAccessor
