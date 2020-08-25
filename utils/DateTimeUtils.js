import {
    format,
    addMilliseconds
} from "date-fns";

//returns formatted date as per format pattern passed
export const formatDate = (date, dateFormat) => format(date, dateFormat);

//Adds milliseconds to date, and returns updated date
export const addMillisecs = (date, milliseconds) => addMilliseconds(date, milliseconds);

/* returns formatted duration as per format string pattern passed
   converts duration milliseconds value passed into Date in milliseconds with timezone offset, and then formats the same using formatString passed
   for example, if duration = 8100000 and formatString = 'HH:mm', this function would return '02:15'
 */
export const formatDuration = (duration, formatString) => formatDate(addMillisecs(new Date(new Date(0).getTimezoneOffset()*1000*60), duration), formatString);