import standardParser from './standardParser';
import stackedParser from './stackedParser';
import multiLineParser from './multiLineParser';
import groupBarParser from './groupBarParser';

export default (props) => {
    if (props.key) {
        return Array.isArray(props.key) ? multiLineParser(props) : stackedParser(props);
    }
    return props.groupedKeys ? groupBarParser(props) : standardParser(props);
}
