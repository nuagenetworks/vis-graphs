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
    limit,
}) => {
    return (
        <YAxis
            type={type}
            dataKey={type ? yColumn : undefined}
            tick={
                <GraphAxis
                    tickFormat={yTickFormat}
                    dy="5"
                    limit={limit}
                />
            }
            label={<AxisLabel text={yLabel} />}
        />
    )
}
