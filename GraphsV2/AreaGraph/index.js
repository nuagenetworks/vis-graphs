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
import WithValiddataHOC from '../../HOC/WithValidationHOC';
import CustomTooltip from '../utils/CustomTooltip';
import dataParser from '../utils/DataParser';
import GraphLegend from '../utils/Legends/Legend';
import GraphAxis from '../utils/GraphAxis';
import config from './default.config';

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
    const parsedData = dataParser({ data, key: linesColumn, xColumn, yColumn });
    const finalParsedData = parsedData.parsedData;
    const uniqueKeys = parsedData.uniqueKeys;
    const legendHeight = (legend.separate * height) / 100;
    const colors = scaleOrdinal(schemeCategory10).range();

    return (
        // Area chart
        <AreaChart
            width={width}
            height={height}
            data={finalParsedData}
            margin={{
              ...margin, 
              top: margin.top * 3,
              bottom: margin.top * 3,
              right: margin.right * 3,
              left: margin.left * 3
            }}
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
                    return (<Area type="monotone" name={areaItem} dataKey={areaItem} stackId={stacked ? "1" : index} stroke={color} fill={color} />)
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
