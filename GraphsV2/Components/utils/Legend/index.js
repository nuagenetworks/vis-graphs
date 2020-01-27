import React from 'react';
import * as customLegends from './export';
import StandardLegend from './StandardLegend';
import {
    Legend as LegendComponent
} from 'recharts';

export default ({ legend, legendHeight, type, ...rest }) => {
    let Component = type ? customLegends[type] : StandardLegend;
    if (legend && legend.show) {
        return (
            <LegendComponent
                wrapperStyle={{ overflowY: 'auto', height: legendHeight }}
                content={(props) => (
                    <Component {...props} legend={legend} {...rest} />
                )}
            />
        )
    }
}
