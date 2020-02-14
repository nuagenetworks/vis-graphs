import React, { useState, useEffect } from 'react';
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
} from '../../constants';
import xAxis from '../Components/utils/xAxis';
import yAxis from '../Components/utils/yAxis';
import { scaleColor } from '../utils/helper';

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
        yLabelLimit,
        brush,
        isCustomColor,
        colorColumn,
        otherColors
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

    XAxisLabelConfig = {...XAxisLabelConfig, dy: XAxisLabelConfig.dy + 30 }

    return (
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
                            onMouseEnter={(props) => {
                                const value = props.value;
                                setToolTipKey(Object.keys(props).find(k => props[k] === (value[1] - value[0])))
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
                    onChange={(e) => updateBrush(e)}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    height={20}
                />
            }
        </BarChart>
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
