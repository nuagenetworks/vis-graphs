import standardParser from './standardParser';
import stackedParser from './stackedParser';
import multiLineParser from './multiLineParser';

export default (props) => {
    const multiLineGraph = Array.isArray(props.key) || props.graph === 'MultiLineGraph';
    if (props.key) {
        return multiLineGraph ? multiLineParser(props) : stackedParser(props);
    }
    return standardParser(props);
}
