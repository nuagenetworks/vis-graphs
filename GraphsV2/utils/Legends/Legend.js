import React from 'react';
import * as customLegends from './';

import StandardLegend from './StandardLegend';

export default ({ type, ...rest }) => {
    let Legend = type ? customLegends[type] : StandardLegend;
    
    return <Legend {...rest} />;
}
