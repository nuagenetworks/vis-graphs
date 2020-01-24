import LinearParser from './LinearParser';
import StackedParser from './StackedParser';

export default (props) => {
    return props.key ? StackedParser(props) : LinearParser(props);
}