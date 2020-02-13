import React from 'react';
import { YAxis } from 'recharts';
import GraphAxis from './GraphAxis';

const AxisLabel = (props) => {
    return (
        <g style={{ textAnchor: 'middle', transform: 'translate(3%,40%)' }}>
            <text style={{ transform: 'rotate(-90deg)' }}  fill='#757575CB'>{props.text}</text>
        </g>
    )
}

export default ({
    yLabel,
    yTickFormat,
    type,
    yColumn,
}) => {
    return (
        <YAxis
            type={type}
            dataKey={type ? yColumn : undefined}
            tick={
                <GraphAxis
                    tickFormat={yTickFormat}
                    dy="5"
                />
            }
            label={<AxisLabel text={yLabel} />}
        />
    )
}
