import standardParser from './standardParser';
import stackedParser from './stackedParser';

export default (props) => {
    return props.key ? stackedParser(props) : standardParser(props);
} 
