import { GridDataAutoCompleteHandler } from "react-filter-box";

export default class AutoCompleteHandler extends GridDataAutoCompleteHandler {
    constructor(data, options, scroll = false) {
        super(data, options);
        this.scroll = scroll;
    }
    needOperators(parsedCategory) {
        var result = super.needOperators(parsedCategory);
        return this.scroll ? ["==", "!="] : result.concat(["startsWith"]);
    }
}