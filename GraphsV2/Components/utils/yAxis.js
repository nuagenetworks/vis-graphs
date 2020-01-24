import React from 'react';
import {
    YAxis,
} from 'recharts';
import GraphAxis from './GraphAxis';

export default ({
    yLabel,
    YAxisLabelConfig,
    yTickFormat,
}) => {
    return (
        <YAxis
            label={{ value: yLabel, ...YAxisLabelConfig }}
            tick={
                <GraphAxis
                    tickFormat={yTickFormat}
                    dy="5"
                />
            }
        />
    )
}