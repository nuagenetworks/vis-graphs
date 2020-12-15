import { format } from 'd3';

export default (props) => {
    const {
        value,
        tickFormat,
    } = props;

    return tickFormat ? format(tickFormat)(value) : value;
}
