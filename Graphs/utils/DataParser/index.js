import standardParser from './standardParser';
import stackedParser from './stackedParser';
import multiLineParser from './multiLineParser';

export default (props) => {
    if (props.key) {
        return Array.isArray(props.key) ? multiLineParser(props) : stackedParser(props);
    }
    return standardParser(props);
}