import { GridDataAutoCompleteHandler } from 'react-filter-box';
import find from 'lodash/find';

export default class AutoCompleteHandler extends GridDataAutoCompleteHandler {
    constructor(data, options, scroll = false) {
        super(data, options);
        this.scroll = scroll;
    }
    needOperators(parsedCategory) {
        const result = super.needOperators(parsedCategory);
        return this.scroll ? ["==", "!="] : result.concat(["startsWith"]);
    }

    needValues(parsedCategory, parsedOperator) {
        const found = find(this.options, f => f.columnField === parsedCategory || f.columnText === parsedCategory);

        if (!found || found === null) {
            return [];
        }
        const parsedField = found.columnField;

        if (found.type === "selection" && this.data !== null) {
            if (!this.cache[parsedField]) {
                this.cache[parsedField] = Array.from(new Set(this.data.map(f => f[parsedField])));
            }
            return this.cache[parsedField];
        }

        if (found.customValuesFunc) {
            return found.customValuesFunc(parsedField, parsedOperator);
        }

        return [];
    }
}