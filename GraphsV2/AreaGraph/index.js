import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import {
    AreaChart,
    Area,
    CartesianGrid,
    Brush,
} from 'recharts';

import WithConfigHOC from '../../HOC/WithConfigHOC';
import WithValiddataHOC from '../../HOC/WithValidationHOC';
import customTooltip from '../Components/utils/AreaTooltip';
import dataParser from '../utils/DataParser';
import Formatter from '../utils/formatter';
import renderLegend from '../Components/utils/Legend';
import config from './default.config';
import xAxis from '../Components/utils/xAxis';
import yAxis from '../Components/utils/yAxis';
import { insertTimestampToTooltip } from '../utils/helper';
import { BRUSH_HEIGHT, XLABEL_HEIGHT, LEGEND_SEPARATE, XTICKS_WIDTH } from '../../constants';

const AreaGraph = (props) => {

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
        XAxisLabelConfig,
        margin,
        xLabelRotateHeight,
        dateHistogram,
        xTickFormat,
        yTickFormat,
        linesColumn,
        stacked,
        colors,
        xLabelLimit,
        yLabelLimit,
        brushEnabled,
        xTicks,
    } = properties;

    let { tooltip } = properties;

    const legendHeight = legend.separate ? (legend.separate * height) / 100 : (LEGEND_SEPARATE * height) / 100;

    if (dateHistogram && tooltip) {
        tooltip = insertTimestampToTooltip({tooltip, xColumn});
    }
    const xtickLimits = xTicks || Math.ceil(width / XTICKS_WIDTH);

    // Formatting data for direct consumption by Area Graph
    const { parsedData, uniqueKeys: areaKeys } = dataParser({
        data,
        key: linesColumn,
        xColumn,
        yColumn,
        isVertical: true
    });

    return (
        <AreaChart
            width={width}
            height={height}
            data={parsedData}
            test-data="area-graph"
            margin={margin}
        >
            <CartesianGrid
                vertical={false}
                strokeOpacity={0.3}
            />
            {
                brushEnabled && (
                    <Brush
                        data={parsedData}
                        dataKey={xColumn}
                        height={BRUSH_HEIGHT}
                        tickFormatter={
                            (tickData) => (Formatter({
                                dateHistogram,
                                value: tickData,
                                tickFormat: xTickFormat
                            }))
                        }
                        y={height - (BRUSH_HEIGHT + XLABEL_HEIGHT + legendHeight)}
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
                    yLabel,
                    yTickFormat,
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
                customTooltip({ tooltip, yColumn, linesColumn, xColumn })
            }
            {
                areaKeys.map((areaItem, index) => {
                    const color = colors[index % colors.length];
                    return (
                        <Area
                            type="monotone"
                            className="area-fill"
                            key={`area-${index}`}
                            name={areaItem}
                            dataKey={areaItem}
                            stackId={stacked ? areaKeys.length : index}
                            stroke={color}
                            fill={color}
                        />
                    )
                })
            }
        </AreaChart>
    );
}

AreaGraph.propTypes = {
    configuration: PropTypes.object,
    data: PropTypes.array,
};

export default compose(
    WithValiddataHOC(),
    (WithConfigHOC(config))
)(AreaGraph);
