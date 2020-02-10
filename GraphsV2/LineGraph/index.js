import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { compose } from 'redux';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { LineChart, Line } from 'recharts';

import config from './default.config';
import WithConfigHOC from '../../HOC/WithConfigHOC';
import WithValidationHOC from '../../HOC/WithValidationHOC';
import customTooltip from '../Components/utils/RechartsTooltip';
import renderLegend from '../Components/utils/Legend';
import dataParser from '../utils/DataParser';
import xAxis from '../Components/utils/xAxis';
import yAxis from '../Components/utils/yAxis';

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
    } = properties;

    const { parsedData, uniqueKeys: lineKeys } = dataParser({
        data,
        key: linesColumn,
        xColumn,
        yColumn,
    });

    const [tooltipName, setToolTipKey] = useState(-1);
    sortByKey(parsedData, 'ts');
    
    const legendHeight = (legend.separate * height) / 100;

    const colors = scaleOrdinal(schemeCategory10).range();
    
    return (
        <LineChart
            width={width}
            height={height}
            data={parsedData}
            margin={margin}>
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
                    legendHeight,
                })
            }
            {
                customTooltip({ tooltip, tooltipName })
            }
            {
                lineKeys.map((lineItem, index) => {
                    const color = colors[index % 20];
                    return (
                        <Line connectNulls={zeroStart}
                            onMouseEnter={({ name }) => setToolTipKey(name)}
                            onMouseLeave={() => setToolTipKey(-1)}
                            type="linear" name={lineItem} dataKey={lineItem} stroke={color} fill={color} />
                    )
                })
            }
        </LineChart>
    );
}

const sortByKey = (array, key) => {
    return array.sort(function (first, second) {
        var x = first[key]; var y = second[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

LineGraph.propTypes = {
    configuration: PropTypes.object,
    data: PropTypes.arrayOf(PropTypes.object),
};

export default compose(
    WithValidationHOC(),
    (WithConfigHOC(config))
)(LineGraph);
