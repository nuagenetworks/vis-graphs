import { GridDataAutoCompleteHandler } from 'react-filter-box';
import find from 'lodash/find';
import _ from 'lodash';

import { ES_NUMBER_DATA_TYPES } from '../constants';

export default class AutoCompleteHandler extends GridDataAutoCompleteHandler {
    constructor(data, options, scroll = false) {
        super(data, options);
        this.scroll = scroll;
    }
    needOperators(parsedCategory) {
        const result = super.needOperators(parsedCategory);
        // check if typeof search column values is number
        const columnType = this.options.filter(val => val.label === parsedCategory && ES_NUMBER_DATA_TYPES.includes(val.columnDataType))[0];

        let operator = ["==", "!="];
        if (!!columnType) {
            operator = ["==", "!=", "<=", ">=", '<', '>'];
        } 
        return this.scroll ? operator : result.concat(["startsWith"]);
    }

    needValues(parsedCategory, parsedOperator) {
        const found = find(this.options, f => f.columnField === parsedCategory || f.columnText === parsedCategory);

        if (!found || found === null) {
            return [];
        }
        const parsedField = found.columnField;

        if (found.type === "selection" && this.data !== null) {
            if (!this.cache[parsedField]) {
                this.cache[parsedField] = _.chain(this.data).map(f => f[parsedField]).uniq().value();
            }
            return this.cache[parsedField];
        }

        if (found.customValuesFunc) {
            return found.customValuesFunc(parsedField, parsedOperator);
        }

        return [];
    }
}