import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import {
    BarChart,
    Bar,
    Cell,
    Brush,
    CartesianGrid
} from 'recharts';

import { config } from './default.config';
import WithConfigHOC from '../../HOC/WithConfigHOC';
import WithValidationHOC from '../../HOC/WithValidationHOC';
import customTooltip from '../Components/utils/RechartsTooltip';
import renderLegend from '../Components/utils/Legend';
import dataParser from '../utils/DataParser';
import {
    DEFAULT_BARGRAPH_ORIENTATION,
    BRUSH_HEIGHT,
    YTICK_LENGTH,
    DEFAULT_MARGIN_LEFT,
} from '../../constants';
import xAxis from '../Components/utils/xAxis';
import yAxis from '../Components/utils/yAxis';
import { scaleColor, longestLabelLength } from '../utils/helper';

const BarGraph = (props) => {
    const [tooltipKey, setToolTipKey] = useState(-1);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(2);

    let timerId = 0;

    const updateBrush = (pos) => {
        if (timerId !== 0) {
            clearTimeout(timerId)
        }
        timerId = setTimeout(() => {
            setStartIndex(pos.startIndex)
            setEndIndex(pos.endIndex)
        }, 500)
    }

    const onDrag = (event) => {
        event.stopPropagation();
        event.preventDefault();
        return false;
    }

    const {
        data,
        height,
        width,
        properties,
        onMarkClick,
        setGraphColor,
    } = props;

    let {
        XAxisLabelConfig,
    } = properties;

    const {
        xColumn,
        yColumn,
        legend,
        tooltip,
        stackColumn,
        orientation,
        otherOptions,
        xLabel,
        xLabelRotateHeight,
        margin,
        yLabel,
        YAxisLabelConfig,
        yTickFormat,
        xTickFormat,
        dateHistogram,
        colors,
        xLabelLimit,
        brush,
        isCustomColor,
        colorColumn,
        otherColors,
        yLabelLimit,
    } = properties;

    let dimension;
    if (orientation === DEFAULT_BARGRAPH_ORIENTATION) {
        dimension = xColumn
    } else {
        dimension = yColumn
    }

    const isVertical = orientation === DEFAULT_BARGRAPH_ORIENTATION ? true : undefined;
    const xAxisType = !isVertical ? "number" : undefined;
    const yAxisType = !isVertical ? "category" : undefined;
    const stack = stackColumn || undefined;
    const column = stackColumn || dimension;
    const isBrush = brush && !stack && brush < data.length;

    const barColors = scaleColor({
        colors,
        otherColors,
        colorColumn,
        isCustomColor,
    }, data, column, setGraphColor);

    const { parsedData, uniqueKeys: barKeys } = dataParser(
        {
            data,
            key: stack,
            xColumn,
            yColumn,
            isVertical
        }
    );

    XAxisLabelConfig = isBrush ? {...XAxisLabelConfig, dy: XAxisLabelConfig.dy + 30 } : XAxisLabelConfig
    const longestLabel = longestLabelLength(parsedData);
    if(longestLabel > YTICK_LENGTH) {
        margin.left = longestLabel + DEFAULT_MARGIN_LEFT;
    }

    return (
        <div onMouseDown={onDrag}>
            <BarChart
                width={width}
                height={height}
                data={parsedData}
                layout={!isVertical ? "vertical" : 'horizontal'}
                cursor={onMarkClick ? "pointer" : ''}
                margin={margin}
            >
                <CartesianGrid
                    vertical={isVertical ? false : true}
                    horizontal={isVertical ? true : false}
                    opacity='0.3'
                />
                {
                    xAxis({
                        xColumn,
                        xLabel,
                        XAxisLabelConfig,
                        xLabelRotateHeight,
                        xTickFormat,
                        dateHistogram,
                        type: xAxisType,
                        limit: xLabelLimit,
                    })
                }

                {
                    yAxis({
                        yLabel,
                        YAxisLabelConfig,
                        yTickFormat,
                        type: yAxisType,
                        yColumn,
                        limit: yLabelLimit,
                    })
                }

                {
                    renderLegend({ legend, height })
                }

                {
                    customTooltip({ tooltip, tooltipKey, yColumn })
                }

                {
                    barKeys.map((item, index) => {
                        return (
                            <Bar
                                key={`barGraph-${index}`}
                                dataKey={item}
                                onClick={(d) => {
                                    if (stack) {
                                        const value = d.value;
                                        d[stackColumn] = Object.keys(d).find(k => d[k] === (value[1] - value[0]));
                                    }
                                    return (
                                        onMarkClick && (!otherOptions || d[dimension] !== otherOptions.label)
                                            ? onMarkClick(d)
                                            : ''
                                    )
                                }}
                                fill={barColors[index % 20]}
                                stackId={stack ? "1" : undefined}
                                onMouseEnter={() => {
                                    setToolTipKey(item)
                                }}
                            >
                                {!stack && parsedData.map((item, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={barColors[(index + startIndex) % 20]}
                                        name={item}
                                    />
                                )
                                )}
                            </Bar>
                        )
                    })

                }
                {
                    isBrush &&
                    <Brush
                        onChange={updateBrush}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        height={BRUSH_HEIGHT}
                    />
                }
            </BarChart>
        </div>
    );
}

BarGraph.propTypes = {
    configuration: PropTypes.object,
    data: PropTypes.arrayOf(PropTypes.object),
};

export default compose(
    (WithConfigHOC(config)),
    WithValidationHOC()
)(BarGraph);
