import React from 'react';
import * as customLegends from './export';
import StandardLegend from './StandardLegend';
import {
    Legend as LegendComponent
} from 'recharts';

export default ({ legend, height, type, ...rest }) => {
    let Component = type ? customLegends[type] : StandardLegend;
    const legendHeight = (legend.separate * height) / 100;
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
