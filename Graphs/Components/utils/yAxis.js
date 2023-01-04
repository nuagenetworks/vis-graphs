import React from 'react';
import { YAxis } from 'recharts';
import GraphAxis from './GraphAxis';
import { YAXIS_ROTATION } from '../../../constants';

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
    isVertical,
}) => {
    return (
        <YAxis
            type={type}
            dataKey={type ? (Array.isArray(yColumn) ? yColumn[0] : yColumn) : undefined}
            axisLine={{ stroke: '#E9ECF0' }}
            tickLine={false}
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
