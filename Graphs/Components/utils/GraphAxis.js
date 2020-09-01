import React from 'react';
import Formatter from '../../utils/formatter';

const GraphAxis = (props) => {
    const {
        x,
        y,
        payload,
        dateHistogram,
        tickFormat,
        limit,
    } = props;

    let {
        rotation,
        textAnchor,
        dx,
        dy,
    } = props;
    rotation = rotation || "0";
    textAnchor = textAnchor || "end";
    dx = dx || 0;
    dy = dy || 0;

    const parsedData = Formatter({
        dateHistogram,
        value: payload.value,
        tickFormat
    })

    return (
        <g transform={`translate(${x},${y})`} className="graph-axis">
            <text
                x={0}
                y={0}
                dx={dx}
                dy={dy}
                textAnchor={textAnchor}
                fill="#757575CB"
                transform={`rotate(${rotation})`}
            >
                {
                    (parsedData.length > limit) ? `${parsedData.substr(0, limit)}...` : parsedData
                }
            </text>
        </g>
    );
}

export default GraphAxis;
