import React, { useContext } from 'react';
import objectPath from 'object-path';

import defaultProperties from '../Graphs/defaultProperties';
import { ThemeContext } from '../ThemeProvider';

export default (config) => (WrappedComponent) => (props) => {
    const { configuration, ...rest} = props;
    const graphThemeConfig = useContext(ThemeContext);
    return (
        <WrappedComponent 
            {...rest}
            properties = {{
                id: configuration.id,
                ...defaultProperties, // common default properties for all the graphs
                ...config, // default properties of a given specific graph
                ...graphThemeConfig,
                ...configuration.data, // override & new properties of a given specific graph
                isCustomColor: objectPath.has(configuration.data, 'colors') || false,
                multiMenu: props.configuration.multiMenu, menu: props.configuration.menu,
            }}
        />
    );
}
