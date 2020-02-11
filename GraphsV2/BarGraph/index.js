import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import {
    BarChart,
    Bar,
    Cell,
    Brush,
    CartesianGrid
} from 'recharts';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';

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

const colors = scaleOrdinal(schemeCategory10).range();

const BarGraph = (props) => {
    const {
        data,
        height,
        width,
        properties,
        onMarkClick
    } = props;

    const {
        xColumn,
        yColumn,
        legend,
        tooltip,
        stackColumn,
        orientation,
        otherOptions,
        XAxisLabelConfig,
        xLabel,
        xLabelRotateHeight,
        margin,
        yLabel,
        YAxisLabelConfig,
        yTickFormat,
        xTickFormat,
        dateHistogram,
    } = properties;

    let dimension;
    if (orientation === DEFAULT_BARGRAPH_ORIENTATION) {
        dimension = xColumn
    } else {
        dimension = yColumn
    }

    const isVertical = orientation === DEFAULT_BARGRAPH_ORIENTATION ? true : undefined;
    const xAxisType = orientation !== DEFAULT_BARGRAPH_ORIENTATION ? "number" : undefined;
    const yAxisType = orientation !== DEFAULT_BARGRAPH_ORIENTATION ? "category" : undefined;
    const stack = stackColumn || undefined;
    const { parsedData, uniqueKeys: barKeys } = dataParser(
        {
            data,
            key: stack,
            xColumn,
            yColumn,
            isVertical
        }
    );

    return (
        <BarChart
            width={width}
            height={height}
            data={parsedData}
            layout={orientation != DEFAULT_BARGRAPH_ORIENTATION ? "vertical" : 'horizontal'}
            cursor={onMarkClick ? "pointer" : ''}
            margin={margin}
        >
            <CartesianGrid vertical={false} />
            {
                xAxis({
                    xColumn,
                    xLabel,
                    XAxisLabelConfig,
                    xLabelRotateHeight,
                    xTickFormat,
                    dateHistogram,
                    type: xAxisType,
                })
            }

            {
                yAxis({
                    yLabel,
                    YAxisLabelConfig,
                    yTickFormat,
                    type: yAxisType,
                    yColumn
                })
            }

            {
                stack && renderLegend({ legend, height })
            }

            {
                customTooltip({ tooltip })
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
                            fill={colors[index % 10]}
                            stackId={stack ? "1" : undefined}
                        >
                            {!stack && parsedData.map((item, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={colors[index % 10]}
                                    name={item}
                                />
                            )
                            )}
                        </Bar>
                    )
                })

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
