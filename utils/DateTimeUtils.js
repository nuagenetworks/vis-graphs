import {
    format
} from "date-fns";

//returns formatted date as per format pattern passed
export const formatDate = (date, dateFormat) => format(date, dateFormat);