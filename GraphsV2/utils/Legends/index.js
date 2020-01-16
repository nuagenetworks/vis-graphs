import React from 'react';

import { PERCENTAGE } from '../../../constants';
import PercentageLegend from './PercentageLegend';
import StandardLegend from './StandardLegend';

const GraphLegend = ({ type, ...rest }) => {
    let Legend = StandardLegend;
    switch (type) {
        case PERCENTAGE:
            Legend = PercentageLegend;
    }

    return <Legend {...rest} />;
}

export default GraphLegend;
