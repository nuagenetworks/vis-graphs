import React from "react";
import ReactTooltip from "react-tooltip";
import * as d3 from "d3";
import isEqual from 'lodash/isEqual';
import max from 'lodash/max';
import objectPath from 'object-path';

import "./style.css"
import defaultProperties from "./defaultProperties";
import columnAccessor from "../utils/columnAccessor";

import {
    format
} from "d3";


export default class AbstractGraph extends React.Component {
    constructor(props, properties = {}) {
        super(props);

        this.properties = properties;
        this.configuredProperties = {};
        this.node = {};
        this.yLabelWidth = 0;
        this.accessors = {}
        this.tooltips = {}
        this.brush = false;
        this.origin = {
            x: 0,
            y: 0
        }

        this.setGraphId();

        // set all configuration into single object
        this.setConfiguredProperties(this.props, properties);
        this.setTooltip();
    }

    componentDidUpdate(prevProps) {
        if (!isEqual(prevProps.configuration.data, this.props.configuration.data)) {
            this.setConfiguredProperties(this.props, this.properties);
            this.setTooltip();
        }
    }

    setTooltip() {
        // Provide tooltips for subclasses.
        const { tooltip, defaultY } = this.getConfiguredProperties();
        if (tooltip) {

            this.setTooltipAccessor(tooltip);
            this.setTooltipAccessor(defaultY ? defaultY.tooltip : null, 'defaultY')

            // Expose tooltipId in case subclasses need it.
            this.tooltipId = `tooltip-${this.getGraphId()}`;

            // This JSX object can be used by subclasses to enable tooltips.
            this.tooltip = (
                <ReactTooltip
                    id={this.tooltipId}
                    place="right"
                    type="dark"
                    effect="float"
                    getContent={[() => this.getTooltipContent(this.hoveredDatum), 200]}
                    afterHide={() => this.handleHideEvent()}
                    afterShow={() => this.handleShowEvent()}
                    delayUpdate={200}
                />
            );

            // Subclasses can enable tooltips on their marks
            // by spreading over the return value from this function
            // when invoked with the mark's data element `d` like this:
            // data.map((d) => <rect { ...this.tooltipProps(d) } />
            this.tooltipProps = (d) => ({
                "data-tip": true,
                "data-for": this.tooltipId,
                "onMouseEnter": () => this.hoveredDatum = d,
                "onMouseMove": () => this.hoveredDatum = d
            });

        } else {
            this.getTooltipContent = () => null
            this.tooltipProps = () => null
        }
    }

    generateRandom() {
        return Math.floor(new Date().valueOf() * Math.random());
    }

    setTooltipAccessor(tooltip, type = 'default') {
        if (!tooltip)
            return;

        this.tooltips[type] = tooltip
        // Generate accessors that apply number and date formatters.
        this.accessors[type] = tooltip.map(columnAccessor);

        // This function is invoked to produce the content of a tooltip.
        this.getTooltipContent = () => {
            // The value of this.hoveredDatum should be set by subclasses
            // on mouseEnter and mouseMove of visual marks
            // to the data entry corresponding to the hovered mark.

            if (this.hoveredDatum) {
                let type = this.hoveredDatum.tooltipName || 'default'
                return this.tooltipContent({ tooltip: this.tooltips[type], accessors: this.accessors[type] })
            } else {
                return;
            }
        }
    }

    tooltipContent({ tooltip, accessors }) {
        let { yTicksLabel } = this.getConfiguredProperties();

        if (!yTicksLabel || typeof yTicksLabel !== 'object') {
            yTicksLabel = {};
        }

        return (
            <React.Fragment>
                {/* Display each tooltip column as "label : value". */}
                {tooltip.map(({ column, label }, i) => {
                    let data = accessors[i](this.hoveredDatum);
                    if (typeof data  === 'boolean') {
                        data = data.toString();
                    }

                    return (data || data === 0) ?
                        (<div key={column}>
                            <strong>
                                {/* Use label if present, fall back to column name. */}
                                {label || column}
                            </strong> : <span>
                                {/* Apply number and date formatting to the value. */}
                                { yTicksLabel[data] || data }
                            </span>
                        </div>
                        ) : null
                })}
            </React.Fragment>
        )
    }

    setGraphId() {
        this.graphId = new Date().valueOf();
    }

    getGraphId() {
        return this.graphId;
    }

    getSVG() {
        return d3.select(this.node);
    }

    handleShowEvent() { }

    handleHideEvent() { }

    wrapD3Text(text, width) {
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

    setConfiguredProperties(props, properties) {
        this.configuredProperties = Object.assign(
            {},
            { isCustomColor: objectPath.has(props.configuration.data, 'colors') || false },
            defaultProperties,
            properties,
            props.configuration.data,
            { multiMenu: props.configuration.multiMenu, menu: props.configuration.menu });
    }

    getConfiguredProperties() {
        return this.configuredProperties;
    }

    getMappedScaleColor(data, defaultColumn) {
        const {
            heatmapColor,
            otherColors,
            mapColors,
            colorColumn,
            mappedColors,
        } = this.getConfiguredProperties();

        if (!colorColumn && !defaultColumn)
            return;

        const domainData = d3.map(data, (d) => d[colorColumn || defaultColumn]).keys().sort();
        const colors = Object.assign({}, mapColors, heatmapColor || {}, mappedColors || {});

        let propColors = [];
        let index = 0;
        domainData.forEach((d) => {
            if (colors[d]) {
                propColors.push(colors[d]);
            } else {
                propColors.push(otherColors[index++]);
            }
        })
        propColors = propColors.concat(otherColors);

        const scale = d3.scaleOrdinal(propColors);
        scale.domain(domainData);

        return scale;
    }

    updateYExtent(yExtent) {
        const { zeroStart, yRangePadding } = this.getConfiguredProperties();

        
        if (zeroStart && yExtent[0] > 0) {
            yExtent[0] = 0;
        }
        
        if (zeroStart && yExtent[1] < 0) {
            yExtent[1] = 0;
        }

        if (!yRangePadding) {
            return yExtent;
        }
        
        let padding = 0.10;
        let diff = Math.floor((yExtent[1] - yExtent[0]) * padding);


        yExtent[0] = (yExtent[0] >= 0 && (yExtent[0] - diff) < 0) ? 0 : yExtent[0] - diff;
        yExtent[1] = (yExtent[1] <= 0 && (yExtent[1] + diff) > 0) ? 0 : yExtent[1] + diff;

        return yExtent;
    }

    scaleColor(data, defaultColumn) {
        const {
            setGraphColor,
        } = this.props;

        const {
            colors,
            otherColors,
            colorColumn,
            isCustomColor,
        } = this.getConfiguredProperties();

        if (!colorColumn && !defaultColumn)
            return;

        let scale;
        const domainData = d3.map(data, (d) => d[colorColumn || defaultColumn]).keys();
        const colorList = [...colors, ...otherColors];

        if (setGraphColor && !isCustomColor) {
            const graphColors = setGraphColor(domainData, colorList);
            scale = d3.scaleOrdinal(graphColors);
        } else {
            scale = d3.scaleOrdinal(colorList);
        }

        scale.domain(domainData);

        return scale;
    }

    longestLabelLength(data, label, formatter) {

        // Basic function if none provided
        if (!label)
            label = (d) => d;

        let format = (d) => d;

        if (formatter)
            format = d3.format(formatter);

        // Extract the longest legend according to the label function
        const lab = label(data.reduce((a, b) => {
            let labelA = label(a);
            let labelB = label(b);

            if (!labelA)
                return b;

            if (!labelB)
                return a;

            return format(labelA.toString()).length > format(labelB.toString()).length ? a : b;
        }, 0));

        const longestLabel = lab ? lab.toString() : '';
        let labelSize = format(longestLabel).length

        // and return its length + 2 to ensure we have enough space
        return labelSize > 8 ? labelSize : labelSize + 2;
    }

    setYlabelWidth(data, yColumn = null) {
        const {
            chartWidthToPixel,
            yTickFormat,
            yLabelLimit,
            appendCharLength
        } = this.getConfiguredProperties();

        yColumn = yColumn ? yColumn : 'yColumn'
        const yLabelFn = (d) => {
            if (yTickFormat === undefined || yTickFormat === null) {
                return d[yColumn];
            }
            const formatter = format(yTickFormat);

            return formatter(d[yColumn]);
        };

        const labelLength = this.longestLabelLength(data, yLabelFn)
        this.yLabelWidth = (labelLength > yLabelLimit ? yLabelLimit + appendCharLength : labelLength) * chartWidthToPixel;
    }

    getYlabelWidth() {
        return this.yLabelWidth;
    }

    setDimensions(props, data = null, column = null, label = null, legendData = null) {
        const {
            graphWidth,
            graphHeight
        } = this.getGraphDimension(label, legendData);
        
        this.setYlabelWidth(data ? data : props.data, column);
        this.setLeftMargin();
        this.setAvailableWidth({width: graphWidth});
        this.setAvailableHeight({height: graphHeight});
    }

    // check condition to apply brush on chart
    isBrushable(data = []) {
        const {
            brush
        } = this.getConfiguredProperties()

        this.brush = brush && brush < data.length
    }

    isBrush() {
        return this.brush
    }

    setLeftMargin() {
        const {
            margin
        } = this.getConfiguredProperties();

        this.leftMargin = margin.left + this.getYlabelWidth();
    }

    getLeftMargin() {
        return this.leftMargin;
    }

    setAvailableWidth({ width }) {
        const {
            margin,
            brushArea
        } = this.getConfiguredProperties();

        this.availableWidth = width - (margin.left + margin.right + this.getYlabelWidth());

        if (this.isBrush() && !this.isVertical()) {
            this.availableWidth = this.availableWidth * (100 - brushArea) / 100
            this.availableMinWidth = width - (this.availableWidth + this.getLeftMargin() + margin.left + margin.right);
            this.availableMinWidth = this.availableMinWidth > 10 ? this.availableMinWidth : 10;
            this.minMarginLeft = this.availableWidth + this.getLeftMargin() + margin.left;
        }
    }

    getAvailableWidth() {
        return this.availableWidth;
    }

    getAvailableMinWidth() {
        return this.availableMinWidth;
    }

    getMinMarginLeft() {
        return this.minMarginLeft;
    }

    // height of x-axis
    getXAxisHeight() {
        const {
            chartHeightToPixel,
            xLabel
        } = this.getConfiguredProperties();

        return xLabel ? chartHeightToPixel : 0;
    }

    setAvailableHeight({ height }) {
        const {
            chartHeightToPixel,
            margin
        } = this.getConfiguredProperties();

        this.availableHeight = height - (chartHeightToPixel + this.getXAxisHeight())

        if (this.isVertical() && this.isBrush()) {
            this.availableHeight = this.availableHeight * 0.75
            this.availableMinHeight = height - (this.availableHeight + (margin.top * 4) + margin.bottom + chartHeightToPixel + this.getXAxisHeight());
        }
    }

    getAvailableHeight() {
        const { xLabelRotateHeight, xLabelRotate } = this.getConfiguredProperties();
        return this.availableHeight - (xLabelRotate ? xLabelRotateHeight : 0);
    }

    getAvailableMinHeight() {
        return this.availableMinHeight;
    }

    getMinMarginTop() {
        const {
            chartHeightToPixel,
            margin
        } = this.getConfiguredProperties();

        return this.availableHeight + chartHeightToPixel + this.getXAxisHeight();
    }

    // Check whether to display chart as vertical or horizontal
    isVertical() {
        const {
            orientation
        } = this.getConfiguredProperties()

        return orientation === 'vertical'
    }

    // Check whether to display legend as vertical or horizontal
    checkIsVerticalLegend() {
        const {
            legend
        } = this.getConfiguredProperties();

        return legend.show && legend.orientation === 'vertical';
    }

    // to show message at the center of container
    renderMessage(message) {
        const {
            configuration
        } = this.props;
        const messageClass = configuration && configuration.data && configuration.data.classes && configuration.data.classes.messageClass;

        return (
            <div id={`${configuration.id}-message`} className={messageClass ? messageClass : "center-text"}>
                {message}
            </div>
        )
    }
    
    // override this method from respective graphs to generate unique key for graph.
    static getGraphKey(configuration = {}) {
        return null;
    }

    getGraphDimension = (label, filterData = null) => {
        const {
            height,
            width,
            data
        } = this.props;

        const { legend } = this.getConfiguredProperties();

        let dimensions = {
            graphWidth: width,
            graphHeight: height,
            legendHeight: 0,
            legendWidth: 0,
            labelWidth:0,
        }

        if (!legend.show || data.length <= 1 ) {
            return dimensions;
        }

        if(filterData) {
            filterData = filterData.filter((e, i) => filterData.findIndex(a => label(a) === label(e)) === i);
        }
        let labelTextWidth = this.getLegendArea(filterData || data, width, label);
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
            const lineHeight = this.getLegendLineHeight(legend);
            const legendData = data.filter((e, i) => data.findIndex(a => label(a) === label(e)) === i);
            let value = ((legendData.length) * lineHeight);
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

    getValueFromPercentage = (value, percentage) => {
        return (percentage * value) / 100;
    };

    getLegendLineHeight(legend) {
        const {
            circleToPixel,
        } = this.getConfiguredProperties();

        return legend.circleSize * circleToPixel;
    }

    renderLegend(data, legend, getColor, label, isVertical) {
        if (!legend.show)	
            return;

        // Getting unique labels
        data = data.filter((e, i) => data.findIndex(a => label(a) === label(e)) === i);
        
        const {
            labelWidth,
            legendWidth,
        } = this.getGraphDimension(label, data);

        const lineHeight = this.getLegendLineHeight(legend);
        let legendContentHeight = (data.length * lineHeight);
        
        const legendContainerStyle = {
            marginLeft: '5px',
            width: legendWidth,
            height: legendContentHeight,
            display: this.checkIsVerticalLegend() ? 'grid' : 'inline-block',
            order:this.checkIsVerticalLegend() ? 1 : 2,
        }

        let legendStyle = {width: '100%'};
        if (isVertical) {
            // Place the legends in the bottom left corner
            legendStyle = { ...legendStyle, alignSelf: 'flex-end', height: legendContentHeight - lineHeight }
        } else {
            // Place legends horizontally
            legendStyle = {
                ...legendStyle,
                display: 'grid',
                gridTemplateColumns: `repeat(auto-fit, minmax(${labelWidth * 2}px, 1fr))`,
            }
        }

        return (
            <div className='legendContainer' style={legendContainerStyle}>
                <div className='legend' style={legendStyle}>
                    {this.getLegendContent(data, legend, getColor, label)}
                </div>
            </div>
        );
    }

    getLegendContent(data, legend, getColor, label) {
        const {
            fontColor
        } = this.getConfiguredProperties();

        const {
            labelWidth
        } = this.getGraphDimension(label, data);

        const lineHeight = this.getLegendLineHeight(legend);

        return data.map((d, i) => {
            return (
                <div key={i} style={{height:lineHeight, width: labelWidth * 0.90 }}>
                    <svg height={lineHeight} width={labelWidth}>
                        <circle
                            cx={legend.circleSize}
                            cy={legend.circleSize}
                            r={legend.circleSize}
                            fill={getColor(d)}
                        />
                        <text
                            style={{fontSize: legend.labelFontSize}}
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

    // Get the string and if xLabelLimit is less than string length, then will truncate and rotate string followed by "..." as well
    wrapTextByWidth(text, { xLabelRotate, xLabelLimit }) {

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

    labelSize(label, LabelFont = 10) {
        const container = d3.select('body').append('svg');
        container.append('text').text(label).style("font-size", LabelFont);
        const dimension = container.node().getBBox();
        container.remove();
        return dimension.width;       
    }

    getLongestLabel(data, label) {
        const {
            legend,
        } = this.getConfiguredProperties();

        if (!label) {
            label = (d) => d;
        }

        let highestLabel = data.map((d) => {
            return this.labelSize(label(d), legend.labelFontSize || 10); 
        });
        
        return max(highestLabel); 
    }

    getLegendArea(data, dimension, label) {
        const {
            legendArea,
        } = this.getConfiguredProperties();

        const highestLabel = this.getLongestLabel(data, label);
    
        if(highestLabel > dimension * legendArea) {
            return dimension * legendArea;
        }

        return highestLabel;
    }
}
