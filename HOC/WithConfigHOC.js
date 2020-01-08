import React from 'react';
import defaultProperties from '../Graphs/defaultProperties';

export default (config) => (WrappedComponent) => (props) => {
    const { configuration, ...rest} = props;
    return (
        <WrappedComponent 
            {...rest}
            properties = {{
                ...defaultProperties, // common default properties for all the graphs
                ...config, // default properties of a given specific graph
                ...configuration.data // override & new properties of a given specific graph
            }}
        />
    );
}
