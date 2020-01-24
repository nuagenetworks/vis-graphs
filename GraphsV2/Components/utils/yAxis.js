import React from 'react';
import { YAxis } from 'recharts';

import { DEFAULT_BARGRAPH_ORIENTATION } from '../../../constants';
import GraphAxis from './GraphAxis';

export default ({
    yLabel,
    YAxisLabelConfig,
    yTickFormat,
    orientation,
    yColumn,
}) => {
    return (
        <YAxis
            label={{ value: yLabel, ...YAxisLabelConfig }}
            type={orientation != DEFAULT_BARGRAPH_ORIENTATION ? "category" : undefined}
            dataKey={orientation != DEFAULT_BARGRAPH_ORIENTATION ? yColumn : undefined}
            tick={
                <GraphAxis
                    tickFormat={yTickFormat}
                    dy="5"
                />
            }
        />
    )
}