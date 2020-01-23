import React from 'react';
import Formatter from './formatter';

const GraphAxis = (props) => {
    const {
        x,
        y,
        payload,
        dateHistogram,
        tickFormat,
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
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dx={dx} dy={dy} textAnchor={textAnchor} fill="#666" transform={`rotate(${rotation})`}>{parsedData}</text>
        </g>
    );
}

export default GraphAxis;
