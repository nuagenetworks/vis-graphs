import TimeFormatter  from './Time';
import NumbersFormatter  from './Numbers';

export default (props) => {
    const {
        value,
        tickFormat,
        dateHistogram,
    } = props;

    return dateHistogram ? TimeFormatter({tickFormat, value}) : NumbersFormatter({tickFormat, value});
}
