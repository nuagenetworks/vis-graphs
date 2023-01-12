import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { compose } from 'redux';
import { LineChart, Line, CartesianGrid, Brush } from 'recharts';

import config from './default.config';
import WithConfigHOC from '../../HOC/WithConfigHOC';
import WithValidationHOC from '../../HOC/WithValidationHOC';
import customTooltip from '../Components/utils/RechartsTooltip';
import renderLegend from '../Components/utils/Legend';
import dataParser from '../utils/DataParser';
import Formatter from '../utils/formatter';
import xAxis from '../Components/utils/xAxis';
import yAxis from '../Components/utils/yAxis';
import { sortAscendingOnKey, insertTimestampToTooltip } from '../utils/helper';
import { BRUSH_HEIGHT, XLABEL_HEIGHT, XTICKS_WIDTH} from '../../constants';

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
        legend,
        margin,
        xLabelRotateHeight,
        dateHistogram,
        xTickFormat,
        yTickFormat,
        linesColumn,
        zeroStart,
        showDots,
        colors,
        xLabelLimit,
        yLabelLimit,
        brushEnabled,
        xTicks,
        graph,
        type,
        activeDotOnlyTooltip
    } = properties;

    let {
      XAxisLabelConfig,
      tooltip,
    } = properties;

    if (dateHistogram && tooltip) {
        tooltip = insertTimestampToTooltip({tooltip, xColumn});
    }

    if (margin.right < 15) {
        margin.right = 15;
    }

    const xtickLimits = xTicks || Math.ceil(width / XTICKS_WIDTH);

    const { parsedData, uniqueKeys: lineKeys } = dataParser({
        data,
        key: linesColumn,
        xColumn,
        yColumn,
        isVertical: true,
        graph
    });

    XAxisLabelConfig = brushEnabled ? {...XAxisLabelConfig, dy: XAxisLabelConfig.dy + XLABEL_HEIGHT } : XAxisLabelConfig;

    const [tooltipKey, setToolTipKey] = useState(-1);
    sortAscendingOnKey(parsedData, 'ts');

    return (
        <LineChart
            test-data="line-graph"
            width={width}
            height={height}
            data={parsedData}
            margin={margin}>
             <CartesianGrid
                vertical = {false}
                strokeOpacity={0.3}
            />
            {
              brushEnabled && (
                <Brush 
                    data={parsedData}
                    dataKey={xColumn}
                    height={BRUSH_HEIGHT}
                    tickFormatter = {
                        (tickData) => (Formatter({
                            dateHistogram,
                            value: tickData,
                            tickFormat:xTickFormat
                        }))
                    }
                    y={height - ( BRUSH_HEIGHT + XLABEL_HEIGHT) }
                />)
            }
            {
                xAxis({
                    xColumn,
                    xLabel,
                    XAxisLabelConfig,
                    xLabelRotateHeight,
                    xTickFormat,
                    dateHistogram,
                    limit: xLabelLimit,
                    interval: Math.floor(parsedData.length / xtickLimits)
                })
            }
            {
                yAxis({
                    yColumn,
                    yLabel,
                    yTickFormat,
                    type: type,
                    limit: yLabelLimit,
                })
            }
            {
                renderLegend({
                    legend,
                    height,
                })
            }
            {
                customTooltip({ tooltip, tooltipKey, yColumn, graph, activeDotOnlyTooltip })
            }
            {
                lineKeys.map((lineItem, index) => {
                    let color = colors[index % colors.length];
                    if (typeof (lineItem) === 'object') {
                        color = lineItem.color || color;
                        lineItem = lineItem.key;
                    }
                    return (
                        <Line
                            connectNulls={zeroStart}
                            key={`line-${index}`}
                            className="line-graph-line"
                            onMouseEnter={() => setToolTipKey(lineItem)}
                            name={lineItem}
                            dataKey={lineItem}
                            stroke={color}
                            fill={color}
                            isAnimationActive={false}
                            activeDot={{
                                onMouseOver: () => setToolTipKey(lineItem),
                                onMouseLeave: () => activeDotOnlyTooltip ? setToolTipKey(-1) : {},
                                r : 8
                            }}
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
