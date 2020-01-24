import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Cell,
    Brush,
} from 'recharts';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';

import { config } from './default.config';
import WithConfigHOC from '../../HOC/WithConfigHOC';
import WithValidationHOC from '../../HOC/WithValidationHOC';
import customTooltip from '../Components/utils/CustomTooltip';
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
        properties
    } = props;

    const {
        xColumn,
        yColumn,
        legend,
        tooltip,
        stackColumn,
        orientation,
        onMarkClick,
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

    const stack = stackColumn || undefined;
    const legendHeight = (legend.separate * height) / 100;
    const { parsedData, uniqueKeys: barKeys } = dataParser(
        {
            data,
            key: stack,
            xColumn,
            yColumn,
            orientation
        }
    );

    return (
        <BarChart
            width={width}
            height={height}
            data={parsedData}
            layout={orientation != DEFAULT_BARGRAPH_ORIENTATION ? "vertical" : 'horizontal'}
            margin={{
                ...margin,
                top: margin.top * 1.5,
                bottom: margin.top * 3,
                right: margin.right * 1.5,
                left: margin.left * 1.5
            }}
        >
            {
                xAxis({
                    xColumn,
                    xLabel,
                    XAxisLabelConfig,
                    xLabelRotateHeight,
                    xTickFormat,
                    dateHistogram,
                    orientation
                })
            }

            {
                yAxis({
                    yLabel,
                    YAxisLabelConfig,
                    yTickFormat,
                    orientation,
                    yColumn
                })
            }

            {
                stack && renderLegend({ legend, legendHeight })
            }

            {
                customTooltip({ tooltip })
            }

            {
                barKeys.map((item, index) => {
                    return (
                        <Bar
                            dataKey={item}
                            onClick={(d) => (
                                onMarkClick && (!otherOptions || d[dimension] !== otherOptions.label)
                                    ? onMarkClick(d)
                                    : ''
                            )}
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
