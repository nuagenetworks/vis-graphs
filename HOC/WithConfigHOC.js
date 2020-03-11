import React, { useContext } from 'react';
import objectPath from 'object-path';

import defaultProperties from '../Graphs/defaultProperties';

export default (config) => (WrappedComponent) => (props) => {
    const { configuration, themeProvider, ...rest} = props;
    const theme = useContext(themeProvider);
    return (
        <WrappedComponent 
            {...rest}
            properties = {{
                id: configuration.id,
                ...defaultProperties, // common default properties for all the graphs
                ...config, // default properties of a given specific graph
                ...theme,
                ...configuration.data, // override & new properties of a given specific graph
                isCustomColor: objectPath.has(configuration.data, 'colors') || false,

            }}
        />
    );
}
