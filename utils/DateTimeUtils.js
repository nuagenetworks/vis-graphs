import {
    format,
    addMilliseconds
} from "date-fns";

//returns formatted date as per format pattern passed
export const formatDate = (date, dateFormat) => format(date, dateFormat);

//Adds milliseconds to date, and returns updated date
export const addMillisecs = (date, milliseconds) => addMilliseconds(date, milliseconds);