import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    Legend
} from 'recharts';

import WithConfigHOC from '../../HOC/WithConfigHOC';
import ValiddataHOC from '../../HOC/ValiddataHOC';
import CustomTooltip from '../utils/CustomTooltip';
import * as dataParser from '../utils/DataParser';
import GraphLegend from '../utils/Legends/';
import GraphAxis from '../utils/GraphAxis';
import config from './default.config';
import {
    PERCENTAGE,
    STANDARD
} from './../../constants';

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
        tooltip,
        legend,
        percentages,
        XAxisLabelConfig,
        YAxisLabelConfig,
        margin,
        xLabelRotateHeight,
        dateHistogram,
        xTickFormat,
        yTickFormat,
        linesColumn,
        stacked,
    } = properties;

    // Formatting data for direct consumption by Area Graph
    const parsedData = dataParser.PraseData({ data, key: linesColumn, xColumn, yColumn });
    const finalParsedData = parsedData.parsedData;
    const uniqueKeys = parsedData.uniqueKeys;
    const type = percentages ? PERCENTAGE : STANDARD;
    const legendHeight = (legend.separate * height) / 100;
    const colors = scaleOrdinal(schemeCategory10).range();

    return (
        // Area chart
        <AreaChart
            width={width}
            height={height}
            data={finalParsedData}
            margin={margin}
        >
            <XAxis
                dataKey={xColumn}
                interval={0}
                label={{ value: xLabel, ...XAxisLabelConfig }}
                tick={
                    <GraphAxis
                        rotation={xLabelRotateHeight * -1}
                        tickFormat={xTickFormat}
                        dateHistogram={dateHistogram}
                        dy="15"
                        dx="-15"
                    />
                }
            />
            <YAxis
                dataKey={yColumn}
                label={{ value: yLabel, ...YAxisLabelConfig }}
                tick={
                    <GraphAxis
                        tickFormat={yTickFormat}
                        dy="5"
                    />
                }
            />
            {
                legend && legend.show && (
                    <Legend
                        wrapperStyle={{ overflowY: 'auto', height: legendHeight }}
                        content={(props) => (
                            <GraphLegend
                                legend={legend}
                                type={type}
                                {...props}
                            />
                        )}
                    />
                )
            }
            {
                tooltip && (
                    <Tooltip
                        content={<CustomTooltip tooltip={tooltip} />}
                        wrapperStyle={{ backgroundColor: "black" }}
                    />
                )
            }
            {
                uniqueKeys.map((areaItem, index) => {
                    const color = colors[index % 20];
                    return (<Area type="monotone" name={areaItem} dataKey={`${areaItem}Y`} stackId={stacked ? "1" : index} stroke={color} fill={color} />)
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
    ValiddataHOC(),
    (WithConfigHOC(config))
)(AreaGraph);
