import React from 'react';
import {
    Legend as LegendComponent
} from 'recharts';

import { LEGEND_SEPARATE } from '../../../../constants';
import * as customLegends from './export';
import StandardLegend from './StandardLegend';

export default ({ legend, height, type, ...rest }) => {
    let Component = type ? customLegends[type] : StandardLegend;
    const legendHeight = legend.separate ? (legend.separate * height) / 100 : (LEGEND_SEPARATE * height) / 100;
    if (legend && legend.show) {
        return (
            <LegendComponent
                wrapperStyle={{ overflowY: 'auto', height: legendHeight, bottom: 5 }}
                content={(props) => (
                    <Component {...props} legend={legend} {...rest} />
                )}
            />
        )
    }
}
