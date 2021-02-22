import PropTypes from 'prop-types';
import React from 'react';
import { compose } from 'redux';
import {
    PieChart,
    Pie,
    Cell
} from 'recharts';

import { 
    LEGEND_PERCENTAGE
} from './../../constants';
import { config } from './default.config';
import WithConfigHOC from '../../HOC/WithConfigHOC';
import WithValidationHOC from '../../HOC/WithValidationHOC';
import customTooltip from '../Components/utils/RechartsTooltip';
import renderLegend from '../Components/utils/Legend';
import { filterEmptyData } from '../../utils/helpers';
import { renderMessage, insertElementIntoTooltip } from '../utils/helper';
import { limit } from '../../utils/helpers/limit';

const PieGraph = (props) => {
    const {
        data: originalData,
        width,
        height,
        properties,
        onMarkClick
    } = props;

    if (!originalData || !originalData.length) {
        return this.renderMessage("No data to visualize");
    }

    const {
        otherOptions,
        labelColumn,
        pieInnerRadius,
        pieOuterRadius,
        showZero,
        sliceColumn,
        legend,
        percentages,
        colors,
        mappedColors,
        id,
        classes,
    } = properties;

    let { tooltip } = properties;

    const settings = {
        "metric": sliceColumn,
        "dimension": labelColumn,
        "limitOption": otherOptions
    };

    const data = limit({
        data: filterEmptyData({
            data: originalData,
            column: sliceColumn,
            showZero: showZero
        }),
        ...settings
    });

    if (!data || !data.length) {
        return renderMessage({ message: "No data to visualize", id, classes });
    }

    const type = percentages ? LEGEND_PERCENTAGE : undefined;

    if (percentages) {
        const Total = data.reduce((prev, cur) => {
            if (typeof prev !== 'number') {
                prev = prev[sliceColumn];
            }
            return prev + cur[sliceColumn];
        }, 0);

        data.forEach(element => {
            element.percantage = `${(element[sliceColumn] / Total * 100).toFixed(2)}%`;
        });

        tooltip = insertElementIntoTooltip(tooltip, { column: "percantage", label: "Percentage" });
    }

    return (
        <PieChart
            width={width}
            height={height}
            cursor={onMarkClick ? "pointer" : ''}
        >
           
            {   
                renderLegend({ legend, height, labelColumn, type})        
            }
            {
                customTooltip({ tooltip })
            }
            <Pie
                labelLine={false}
                data={data}
                innerRadius={pieInnerRadius * 100}
                outerRadius={pieOuterRadius * 100}
                dataKey={sliceColumn}
                startAngle={90}
                endAngle={-270}
                onClick={
                    (d) => (
                        onMarkClick && (!otherOptions || d[labelColumn] !== otherOptions.label)
                            ? onMarkClick(d)
                            : ''
                    )
                }
            >
                {
                    data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={mappedColors ? mappedColors[entry[labelColumn]] : colors[index]} />
                    ))
                }
            </Pie>
        </PieChart>
    );
}

PieGraph.propTypes = {
    configuration: PropTypes.object,
    data: PropTypes.arrayOf(PropTypes.object),
};

export default compose(
    WithValidationHOC(),
    (WithConfigHOC(config))
)(PieGraph);
