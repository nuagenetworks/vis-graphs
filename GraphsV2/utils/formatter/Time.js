import moment from 'moment';

export default (props) => {
    const {
        value,
        tickFormat,
    } = props;
    let format = tickFormat && !tickFormat.includes("%") ? tickFormat : "LT";
    return moment(value).format(format);
}
