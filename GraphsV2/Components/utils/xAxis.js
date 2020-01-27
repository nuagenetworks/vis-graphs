import React from 'react';
import { XAxis } from 'recharts';

import { DEFAULT_BARGRAPH_ORIENTATION } from '../../../constants';
import GraphAxis from './GraphAxis';

export default ({
    xColumn,
    xLabel,
    XAxisLabelConfig,
    xLabelRotateHeight,
    xTickFormat,
    dateHistogram,
    orientation
}) => {
    return (
        <XAxis
            type={orientation && orientation != DEFAULT_BARGRAPH_ORIENTATION ? "number" : undefined}
            dataKey={xColumn}
            interval={0}
            label={{ value: xLabel, ...XAxisLabelConfig }}
            tick={
                <GraphAxis
                    rotation={xLabelRotateHeight * -1}
                    tickFormat={xTickFormat}
                    dateHistogram={dateHistogram}
                    dy="15"
                    dx="-15"
                />
            }
        />
    )
}
