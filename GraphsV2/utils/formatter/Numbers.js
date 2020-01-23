import * as d3 from 'd3';

export default (props) => {
    const {
        value,
        tickFormat,
    } = props;

    return tickFormat ? d3.format(tickFormat)(value) : value;
}
