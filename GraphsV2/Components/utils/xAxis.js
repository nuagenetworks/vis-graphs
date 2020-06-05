import React from 'react';
import { XAxis } from 'recharts';

import { X_AXIS_HEIGHT } from '../../../constants';
import GraphAxis from './GraphAxis';

export default ({
    xColumn,
    xLabel,
    XAxisLabelConfig,
    xLabelRotateHeight,
    xTickFormat,
    dateHistogram,
    type,
    limit
}) => {
    return (
        <XAxis
            type={type}
            dataKey={xColumn}
            interval={0}
            label={{ value: xLabel, ...XAxisLabelConfig }}
            height={X_AXIS_HEIGHT}
            axisLine={{ stroke: '#E9ECF0' }}
            tickLine={false}
            tick={
                <GraphAxis
                    rotation={xLabelRotateHeight * -1}
                    tickFormat={xTickFormat}
                    dateHistogram={dateHistogram}
                    dy="15"
                    dx="-15"
                    limit={limit}
                />
            }
        />
    )
}
