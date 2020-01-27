import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import {
    AreaChart,
    Area,
} from 'recharts';
import WithConfigHOC from '../../HOC/WithConfigHOC';
import WithValiddataHOC from '../../HOC/WithValidationHOC';
import customTooltip from '../Components/utils/CustomTooltip';
import dataParser from '../utils/DataParser';
import renderLegend from '../Components/utils/Legend';
import config from './default.config';
import xAxis from '../Components/utils/xAxis';
import yAxis from '../Components/utils/yAxis';

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
        margin,
        xLabelRotateHeight,
        dateHistogram,
        xTickFormat,
        yTickFormat,
        linesColumn,
        stacked,
    } = properties;

    // Formatting data for direct consumption by Area Graph
    const { parsedData, uniqueKeys: areaKeys } = dataParser({ 
      data, 
      key: linesColumn, 
      xColumn, 
      yColumn 
    });
    const legendHeight = (legend.separate * height) / 100;
    const colors = scaleOrdinal(schemeCategory10).range();

    return (
        <AreaChart
            width={width}
            height={height}
            data={parsedData}
            margin={{
              ...margin, 
              top: margin.top * 3,
              bottom: margin.top * 3,
              right: margin.right * 3,
              left: margin.left * 3
            }}
        >
            {
              xAxis({
                xColumn, 
                xLabel, 
                XAxisLabelConfig, 
                xLabelRotateHeight, 
                xTickFormat, 
                dateHistogram
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
                legendHeight,
              })
            }
            {
                customTooltip({ tooltip })
            }
            {
                areaKeys.map((areaItem, index) => {
                    const color = colors[index % 20];
                    return (
                      <Area type="monotone" name={areaItem} dataKey={areaItem} stackId={stacked ? "1" : index} stroke={color} fill={color} />
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
