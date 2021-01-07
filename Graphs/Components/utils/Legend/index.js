import React from 'react';
import {
    Legend as LegendComponent
} from 'recharts';

import { LEGEND_SEPARATE } from '../../../../constants';
import * as customLegends from './export';
import StandardLegend from './StandardLegend';

export default ({ legend, height, type, margin, ...rest }) => {
    let Component = type ? customLegends[type] || StandardLegend : StandardLegend;
    const legendHeight = legend.separate ? (legend.separate * height) / 100 : (LEGEND_SEPARATE * height) / 100;
    const marginLeft = margin ? margin.left : 0;
    if (legend && legend.show) {
        return (
            <LegendComponent
                wrapperStyle={{ overflowY: 'auto', maxHeight: legendHeight, bottom: 5, marginLeft }}
                content={(props) => (
                    <Component {...props} legend={legend} {...rest} />
                )}
            />
        )
    }
}
