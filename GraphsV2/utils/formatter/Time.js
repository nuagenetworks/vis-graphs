import moment from 'moment';

export default (props) => {
    const {
        value,
        tickFormat,
    } = props;

    return moment(value).format(tickFormat || "LT");
}
