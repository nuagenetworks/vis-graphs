import React from 'react';
import defaultProperties from '../Graphs/defaultProperties';

export default (config) => (WrappedComponent) => (props) => {
    const { configuration, ...rest} = props;
    return (
        <WrappedComponent 
            {...rest}
            properties = {{
                ...defaultProperties, 
                ...config, 
                ...configuration.data
            }}
        />
    );
}
