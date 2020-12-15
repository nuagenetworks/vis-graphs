import React from "react";
import max from 'lodash/max';
import * as d3 from "d3";
import ReactTooltip from "react-tooltip";

import columnAccessor from "../../utils/columnAccessor";

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

    if (!legend.show) {
        return;
    }

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
        marginTop:'0.6rem',
        marginLeft: '5px',
        width: legendWidth,
        height: legendHeight,
        display: isVertical ? 'grid' : 'inline-block',
        order: isVertical ? 1 : 2,
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


export const getGraphDimension = (props, label, filterData = null, isVertical) => {
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

    if (!legend.show || data.length < 1) {
        return dimensions;
    }

    if (filterData) {
        filterData = filterData.filter((e, i) => filterData.findIndex(a => label(a) === label(e)) === i);
    }

    let labelTextWidth = getLegendArea({ legend, legendArea }, filterData || data, width, label);
    labelTextWidth = labelTextWidth + ((legend.circleSize || 4) * 5) + (legend.labelOffset || 10);

    // Compute the available space considering a legend
    if (isVertical) {
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

    const highestLabel = getLongestLabel(legend, data, label);

    if (highestLabel > dimension * legendArea) {
        return dimension * legendArea;
    }

    return highestLabel;
}

export const getLongestLabel = (legend, data, label) => {
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

export const checkIsVerticalLegend = (legend) => legend.show && legend.orientation === 'vertical';

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
                        fill={getColor(d)}
                    />
                    <text
                        style={{ fontSize: legend.labelFontSize }}
                        fill={fontColor}
                        alignmentBaseline="baseline"
                        x={legend.circleSize * 2 + legend.labelOffset}
                        y={legend.circleSize + 2 + legend.labelOffset}
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


export const renderMessage = (props) => {
    const {
        classes,
        message,
        id
    } = props;
    const messageClass = classes && classes.messageClass;

     return (
        <div id={`${id}-message`} className={`center-text ${messageClass || ''}`}>
            {message}
        </div>
    )
}

export const longestLabelLength = (data, label, formatter) => {

    // Basic function if none provided
    if (!label)
        label = (d) => d;

    let format = (d) => d;

    if (formatter)
        format = format(formatter);

    // Extract the longest legend according to the label function
    const lab = label(data.reduce((a, b) => {
        let labelA = label(a);
        let labelB = label(b);

        if (!labelA)
            return b;

        if (!labelB)
            return a;

        return format(labelA.toString()).length > format(labelB.toString()).length ? a : b;
    }));

    const longestLabel = lab ? lab.toString() : '';
    let labelSize = format(longestLabel).length

    // and return its length + 2 to ensure we have enough space
    return labelSize > 8 ? labelSize : labelSize + 2;
}

export const customTooltip = (properties) => {
    let getTooltipContent;

    const { tooltip, id } = properties;

    let { yTicksLabel } = properties;

    const setTooltipAccessor = () => {
        if (!tooltip) {
            return;
        }

        // This function is invoked to produce the content of a tooltip.
        getTooltipContent = (d) => {
            // The value of this.hoveredDatum should be set by subclasses
            // on mouseEnter and mouseMove of visual marks
            // to the data entry corresponding to the hovered mark.
            return d ? tooltipContent(d) : '';
        }
    }

    const tooltipContent = (d) => {
        if (!Array.isArray(tooltip)) {
            return null;
        }

        if (!yTicksLabel || typeof yTicksLabel !== 'object') {
            yTicksLabel = {};
        }

        const accessors = tooltip.map(columnAccessor);

        return (
            /* Display each tooltip column as "label : value". */
            tooltip.map(({ column, label }, i) => {
                const data = accessors[i](d)

                return (data !== null && data !== 'undefined') ?
                    (
                        <div key={column}>
                            <strong>
                                {/* Use label if present, fall back to column name. */}
                                {label || column}
                            </strong> : <span>
                                {/* Apply number and date formatting to the value. */}
                                {yTicksLabel[data] || data}
                            </span>
                        </div>
                    ) : null;
            })
        )
    }

    const tooltipWrapper = (data) => (<ReactTooltip
        id={id}
        place="top"
        type="dark"
        effect="float"
        getContent={[() => getTooltipContent(data), 200]}
    />)

    // Provide tooltips for subclasses.
    if (tooltip) {
        setTooltipAccessor(tooltip, yTicksLabel);
        // This JSX object can be used by subclasses to enable tooltips.
        tooltipWrapper(null);

    } else {
        getTooltipContent = () => null
    }

    return { tooltipWrapper }
} 

export const wrapTextByWidth = (text, { xLabelRotate, xLabelLimit }) => {

  text.each(function () {
      const text = d3.select(this);
      const words = text.text();
      const tspan = text.text(null)
          .append("tspan")
          .attr("x", -2)
          .attr("y", text.attr("y"))
          .attr("dy", parseFloat(text.attr("dy")) + "em")
          .text(words);

      if (xLabelRotate) {
          text.attr("transform", "rotate(-50)")
              .attr("dy", ".15em")
              .style("text-anchor", "end")
      }

      if (words.length > xLabelLimit) {
          text.style('cursor', 'pointer')
              .append('title').text(words);

          tspan.text(words.substr(0, xLabelLimit) + '...');
      }
  });
}

export const wrapD3Text = (text, width) => {
  text.each(function () {
      var text = d3.select(this);
      var words = text.text(),

          y = text.attr("y"),
          dy = parseFloat(text.attr("dy")),
          tspan = text.text(null).append("tspan").attr("x", -3).attr("y", y).attr("dy", dy + "em");
      tspan.text(words);

      if (words.length > width) {
          text.style('cursor', 'pointer').append('title').text(words)
          tspan.text(words.substr(0, width) + '...')
      }
  });
};

export const insertElementIntoTooltip = (tooltip, element) => ([element, ...tooltip]);

export const insertTimestampToTooltip = ({ tooltip, xColumn }) => {
    const timestampTooltip = tooltip.filter(element => element.column === xColumn);
    if (!timestampTooltip.length) {
        return insertElementIntoTooltip(tooltip, { column: xColumn, label: "Timestamp", timeFormat: "%b %d, %y %X"});
    }
    return tooltip;
}