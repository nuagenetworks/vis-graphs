import React from 'react';
import {
  XAxis,
} from 'recharts';
import GraphAxis from './GraphAxis';

export default ({
  xColumn, 
  xLabel, 
  XAxisLabelConfig, 
  xLabelRotateHeight, 
  xTickFormat, 
  dateHistogram,
}) => {
  return (
    <XAxis
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