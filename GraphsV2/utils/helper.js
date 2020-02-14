import React from "react";
import max from 'lodash/max';
import * as d3 from "d3";

export const sortAscendingOnKey = (array, key) => {
    return array.sort(function (first, second) {
        var x = first[key]; var y = second[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

export const renderLegend = (props, data, legend, getColor, label, isVertical) => {
    const {
        height,
        width,
        legendArea,
        fontColor,
        circleToPixel,
    } = props;

    if (!legend.show)
        return;

    const dataUnique = data.filter((e, i) => data.findIndex(a => label(a) === label(e)) === i);

    const {
        labelWidth,
        legendWidth,
        legendHeight,
    } = getGraphDimension({
        height,
        width,
        data,
        legend,
        legendArea,
    }, label, dataUnique);

    const legendContainerStyle = {
        marginLeft: '5px',
        width: legendWidth,
        height: legendHeight,
        display: checkIsVerticalLegend({ legend }) ? 'grid' : 'inline-block',
        order: checkIsVerticalLegend({ legend }) ? 1 : 2,
    }

    let legendStyle = {};
    if (isVertical) {
        // Place the legends in the bottom left corner
        legendStyle = { alignSelf: 'flex-end' }
    } else {
        // Place legends horizontally
        legendStyle = {
            width: '100%',
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(${labelWidth * 2}px, 1fr))`,
        }
    }

    return (
        <div className='legendContainer' style={legendContainerStyle}>
            <div className='legend' style={legendStyle}>
                {getLegendContent({ fontColor, circleToPixel, height, width, data, legend, legendArea }, dataUnique, legend, getColor, label)}
            </div>
        </div>
    );
}


export const getGraphDimension = (props, label, filterData = null) => {
    const {
        height,
        width,
        data,
        legendArea,
        legend
    } = props;

    let dimensions = {
        graphWidth: width,
        graphHeight: height,
        legendHeight: 0,
        legendWidth: 0,
        labelWidth: 0,
    }

    if (!legend.show || data.length <= 1) {
        return dimensions;
    }

    if (filterData) {
        filterData = filterData.filter((e, i) => filterData.findIndex(a => label(a) === label(e)) === i);
    }

    let labelTextWidth = getLegendArea({ legend, legendArea }, filterData || data, width, label);
    labelTextWidth = labelTextWidth + ((legend.circleSize || 4) * 5) + (legend.labelOffset || 10);

    // Compute the available space considering a legend
    if (legend.orientation === 'vertical') {
        dimensions = {
            ...dimensions,
            graphWidth: width - labelTextWidth,
            legendWidth: labelTextWidth,
            legendHeight: height,
            labelWidth: labelTextWidth
        }
    } else {
        const value = getLegendArea({ legend, legendArea }, filterData || data, height, label);
        dimensions = {
            ...dimensions,
            graphHeight: height - value,
            legendHeight: value,
            legendWidth: width,
            labelWidth: labelTextWidth,
        }
    }

    return dimensions;
}

export const getLegendArea = (props, data, dimension, label) => {
    const {
        legend,
        legendArea,
    } = props;

    const highestLabel = getLongestLabel({ legend }, data, label);

    if (highestLabel > dimension * legendArea) {
        return dimension * legendArea;
    }

    return highestLabel;
}

export const getLongestLabel = (props, data, label) => {
    const {
        legend,
    } = props;

    if (!label) {
        label = (d) => d;
    }

    let highestLabel = data.map((d) => {
        return labelSize(label(d), legend.labelFontSize || 10);
    });

    return max(highestLabel);
}

export const labelSize = (label, LabelFont = 10) => {
    const container = d3.select('body').append('svg');
    container.append('text').text(label).style("font-size", LabelFont);
    const dimension = container.node().getBBox();
    container.remove();
    return dimension.width;
}

export const checkIsVerticalLegend = (props) => {
    const {
        legend
    } = props;

    return legend.show && legend.orientation === 'vertical';
}

export const getLegendContent = (props, data, legend, getColor, label) => {
    const {
        height,
        width,
        legendArea,
        fontColor,
        circleToPixel,
    } = props;

    const {
        labelWidth
    } = getGraphDimension({
        height,
        width,
        data,
        legend,
        legendArea,
    }, label, data);

    const lineHeight = legend.circleSize * circleToPixel;

    return data.map((d, i) => {
        return (
            <div key={i} style={{ height: lineHeight, width: labelWidth * 0.90 }}>
                <svg height={lineHeight} width={labelWidth}>
                    <circle
                        cx={legend.circleSize}
                        cy={legend.circleSize}
                        r={legend.circleSize}
                        fill={getColor(props, d)}
                    />
                    <text
                        style={{ fontSize: legend.labelFontSize }}
                        fill={fontColor}
                        alignmentBaseline="baseline"
                        x={legend.circleSize * 2 + legend.labelOffset}
                        y={legend.circleSize + 3}
                    >
                        {label(d)}
                    </text>
                </svg>
            </div>
        );
    })
}

export const scaleColor = (props, data, defaultColumn, setGraphColor) => {

    const {
        colors,
        otherColors,
        colorColumn,
        isCustomColor,
    } = props;

    if (!colorColumn && !defaultColumn)
        return;

    const domainData = d3.map(data, (d) => d[colorColumn || defaultColumn]).keys();
    let colorList = [...colors, ...otherColors];
    
    if (setGraphColor && !isCustomColor) {
        colorList = setGraphColor(domainData, colorList);
    } 

    return colorList;
}
