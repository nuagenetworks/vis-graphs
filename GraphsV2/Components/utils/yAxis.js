import React from 'react';
import { YAxis, Label } from 'recharts';
import { DEFAULT_BARGRAPH_ORIENTATION } from '../../../constants';
import GraphAxis from './GraphAxis';

export default ({
    yLabel,
    yTickFormat,
    orientation,
    yColumn,
}) => {
    return (
        <YAxis
            type={orientation && orientation != DEFAULT_BARGRAPH_ORIENTATION ? "category" : undefined}
            dataKey={orientation && orientation != DEFAULT_BARGRAPH_ORIENTATION ? yColumn : undefined}
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

const AxisLabel = (props) => {
    return (
        <g style={{ textAnchor: 'middle', transform: 'translate(3%,40%)' }}>
            <text style={{ transform: 'rotate(-90deg)' }}>{props.text}</text>
        </g>
    )
}
