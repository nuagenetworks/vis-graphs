import TimeFormatter  from './Time';
import NumbersFormatter  from './Numbers';

export default (props) => {
    const {
        value,
        tickFormat,
        dateHistogram,
        tickLabel,
    } = props;

    return tickLabel  && tickLabel[value] ? tickLabel[value]
            :
            dateHistogram ? TimeFormatter({tickFormat, value}) : NumbersFormatter({tickFormat, value})
}
