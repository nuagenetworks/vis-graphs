import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { compose } from 'redux';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { LineChart, Line, CartesianGrid } from 'recharts';

import config from './default.config';
import WithConfigHOC from '../../HOC/WithConfigHOC';
import WithValidationHOC from '../../HOC/WithValidationHOC';
import customTooltip from '../Components/utils/RechartsTooltip';
import renderLegend from '../Components/utils/Legend';
import dataParser from '../utils/DataParser';
import xAxis from '../Components/utils/xAxis';
import yAxis from '../Components/utils/yAxis';
import { sortAscendingOnKey } from '../utils/helper';

const LineGraph = (props) => {
    const {
        properties,
        height,
        width,
        data,
    } = props;

    const {
        xLabel,
        yLabel,
        xColumn,
        yColumn,
        tooltip,
        legend,
        XAxisLabelConfig,
        margin,
        xLabelRotateHeight,
        dateHistogram,
        xTickFormat,
        yTickFormat,
        linesColumn,
        zeroStart,
        showDots,
    } = properties;

    const { parsedData, uniqueKeys: lineKeys } = dataParser({
        data,
        key: linesColumn,
        xColumn,
        yColumn,
    });

    const [tooltipKey, setToolTipKey] = useState(-1);
    sortAscendingOnKey(parsedData, 'ts');

    const colors = scaleOrdinal(schemeCategory10).range();
    
    return (
        <LineChart
            test-data="line-graph"
            width={width}
            height={height}
            data={parsedData}
            margin={margin}>
            <CartesianGrid vertical={false} />
            {
                xAxis({
                    xColumn,
                    xLabel,
                    XAxisLabelConfig,
                    xLabelRotateHeight,
                    xTickFormat,
                    dateHistogram,
                })
            }
            {
                yAxis({
                    yLabel,
                    yTickFormat,
                })
            }
            {
                renderLegend({
                    legend,
                    height,
                })
            }
            {
                customTooltip({ tooltip, tooltipKey })
            }
            {
                lineKeys.map((lineItem, index) => {
                    const color = colors[index % colors.length];
                    return (
                        <Line 
                            connectNulls={zeroStart}
                            key={`line-${index}`}
                            onMouseEnter={({ name }) => setToolTipKey(name)}
                            onMouseLeave={() => setToolTipKey(-1)}
                            name={lineItem}
                            dataKey={lineItem}
                            stroke={color}
                            fill={color} 
                            isAnimationActive={false}
                            activeDot={{r: 8}}
                            dot={showDots}
                        />
                    )
                })
            }
        </LineChart>
    );
}

LineGraph.propTypes = {
    configuration: PropTypes.object,
    data: PropTypes.arrayOf(PropTypes.object),
};

export default compose(
    WithValidationHOC(),
    (WithConfigHOC(config))
)(LineGraph);
