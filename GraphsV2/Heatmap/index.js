import PropTypes from 'prop-types';
import React, { useEffect, useState } from "react"
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import * as d3 from "d3"
import { compose } from 'redux';
import { styled } from '@material-ui/core/styles';

import WithConfigHOC from '../../HOC/WithConfigHOC';
import WithValidationHOC from '../../HOC/WithValidationHOC';
import { properties } from "./default.config"
import { nest as dataNest } from "../../utils/helpers/nest";
import customTooltip from '../utils/customTooltip';
import {
    renderLegend,
    getGraphDimension,
    checkIsVerticalLegend,
    renderMessage,
    longestLabelLength,
    wrapTextByWidth,
    wrapD3Text,
} from "../utils/helper";

    let filterData = [];
    let nestedXData = [];
    let nestedYData = [];
    let cellColumnsData = [];

    let scale = {};
    let boxSize = {};
    let bandScale = {};
    let brush = false;
    let leftMargin = 0;
    let node = "";
    let availableMinWidth = 0;

const HeatmapGraph = (props) => {
    const {
        data,
        width,
        height,
        properties,
    } = props;

    const {
        id,
        yColumn,
        xColumn,
        margin,
        legend,
        legendArea,
        fontColor,
        circleToPixel,
        chartHeightToPixel,
        xLabel,
    } = properties;

    const [graphId] = useState(new Date().valueOf());
    const [availableHeight, setAvailableGraphHeight] = useState(0);
    const [availableWidth, setAvailableGraphWidth] = useState(0)
    const [graphWidth, setGraphWidth] = useState(0);
    const [graphHeight, setGraphHeight] = useState(0);
    const [titlePosition, setGraphTitlePosition] = useState("");
    const [axis, setGraphAxis] = useState({});
    const [customTooltips, setCustomTooltips] = useState({});
    const [hoveredDatum, setHoveredDataum] = useState(null);
    const [minMarginLeft, setMinMarginLeft] = useState(0);
    const [yLabelWidth, setGraphYLabelWidth] = useState(0);

    useEffect(() => {
        initiate();
        elementGenerator();
        updateElements();
        setCustomTooltips(customTooltip(properties));
    }, [props.data, props.height, props.width, props.context]);


    const initiate = () => {
        parseData();
        setDimensions(getFilterData(), yColumn, (d) => d["key"], getCellColumnData());
        configureAxis();
    }

    const configureAxis = () => {
        const data = getFilterData();
        setBandScale(data);
        setScale(data);
        setAxis(data);
        setTitlePositions();
    }

    const setTitlePositions = () => {
        const {
            xLabelRotate,
            xLabelRotateHeight,
            chartWidthToPixel,
        } = properties;
        setGraphTitlePosition(({
            x: {
                left: getLeftMargin() + availableWidth / 2,
                top: margin.top + availableHeight + chartHeightToPixel + getXAxisHeight() + (xLabelRotate ? xLabelRotateHeight : 0)
            },
            y: {
                left: margin.left + chartWidthToPixel,
                top: margin.top + availableHeight / 2
            }
        }));
    }

    const setBandScale = (data) => {
        bandScale.x = d3.scaleBand().domain(d3.map(data, getXLabelFn()).keys().sort());
        bandScale.x.rangeRound([0, availableWidth]);

        bandScale.y = d3.scaleBand().domain(d3.map(data, getYLabelFn()).keys().sort());
        bandScale.y.rangeRound([0, availableHeight]);
    }

    const getXAxisHeight = () => xLabel ? chartHeightToPixel : 0;

    const getAvailableMinWidth = () => availableMinWidth;

    const getMinMarginLeft = () => minMarginLeft;

    const setDimensions = (data = null, column = null, label = null, legendData = null) => {
        const {
            graphWidth,
            graphHeight
        } = getGraphDimension({
            height,
            width,
            data,
            legendArea,
            legend,
        }, label, legendData);

        setGraphWidth(graphWidth);
        setGraphHeight(graphHeight);

        setYlabelWidth(data || props.data, column);
        setLeftMargin();

        setAvailableWidth(graphWidth);
        setAvailableHeight(graphHeight);
    }

    const setAvailableHeight = (height) => {
        let availableHeightT = height - (margin.top + margin.bottom + chartHeightToPixel + getXAxisHeight())

        if (isBrush()) {
            availableHeightT = availableHeightT * 0.75;
        }
        setAvailableGraphHeight(availableHeightT);
    }

    const setAvailableWidth = (width) => {
        const {
            brushArea
        } = properties;
        let availableWidthT = width - (margin.left + margin.right + getYlabelWidth());

        if (isBrush()) {
            availableWidthT = availableWidthT * (100 - brushArea) / 100
            availableMinWidth = width - (availableWidthT + getLeftMargin() + margin.left + margin.right);
            availableMinWidth = availableMinWidth > 10 ? availableMinWidth : 10;
            setMinMarginLeft(availableWidthT + getLeftMargin() + margin.left);
        }
        setAvailableGraphWidth(availableWidthT);
    }

    const parseData = () => {
        const {
            legendColumn,
        } = properties;

        nestedXData = dataNest({
            data,
            key: xColumn,
            sortColumn: xColumn
        })

        nestedYData = dataNest({
            data,
            key: yColumn,
            sortColumn: yColumn
        })

        let filteringData = [];

        nestedYData.forEach((item, i) => {
            if (!item.key || typeof item.key === 'object' || item.key === 'null' || item.key === 'undefined') {
                nestedYData.splice(i, 1);
            }
        });

        nestedYData.forEach((item, i) => {

            const d = Object.assign({}, item)

            nestedXData.forEach(list => {
                if (!list.key || typeof list.key === 'object')
                    return

                const index = (d.values).findIndex(o => {
                    return `${o[xColumn]}` === `${list.key}`
                })

                if (index !== -1
                    && d.values[index][yColumn] !== ''
                    && d.values[index][yColumn] !== 'undefined'
                    && typeof d.values[index][yColumn] !== 'object'
                ) {
                    filteringData.push(d.values[index])
                } else {
                    filteringData.push({
                        [yColumn]: d.key,
                        [legendColumn]: 'Empty',
                        [xColumn]: parseInt(list.key, 10)
                    });
                }
            })
        })

        cellColumnsData = d3.nest()
            .key((d) => legendColumn ? d[legendColumn] : "Cell")
            .entries(filteringData);

        if (filteringData.length) {
            isBrushable(nestedYData);
        }

        if (!isEqual(filteringData, filterData)) {
            filterData = filteringData;
        }
    }

    const getNestedYData = () => (nestedYData || []);

    const getNestedXData = () => (nestedXData || []);

    const getFilterData = () => (filterData || []);

    const getCellColumnData = () => (cellColumnsData || []);

    const getXLabelFn = () => ((d) => d[xColumn]);

    const getYLabelFn = () => ((d) => d[yColumn]);

    const setBoxSize = () => {
        const {
            brush,
        } = properties;

        const height = availableHeight / (isBrush() ? brush : getNestedYData().length),
            width = availableWidth / getNestedXData().length;

        boxSize = { height, width };
    }

    const getBoxSize = () => (boxSize || 0);

    const setScale = (data) => {
        const {
            xAlign
        } = properties

        const distXDatas = d3.map(data, getXLabelFn()).keys().sort();
        const distYDatas = d3.map(data, getYLabelFn()).keys().sort();

        const xValues = d3.extent(data, getXLabelFn())
        const xPadding = distXDatas.length > 1 ? ((xValues[1] - xValues[0]) / (distXDatas.length - 1)) / 2 : 1

        setBoxSize();

        let minValue = xValues[0];
        let maxValue = xValues[1];

        if (xAlign) {
            maxValue += xPadding * 2;
        } else {
            minValue -= xPadding;
            maxValue += xPadding;
        }

        scale.x = d3.scaleTime()
            .domain([minValue, maxValue])
            .range([0, availableWidth]);

        scale.y = d3.scaleBand()
            .domain(distYDatas)
            .rangeRound([availableHeight, 0]);
    }

    const setAxis = (data) => {
        const {
            xTickSizeInner,
            xTickSizeOuter,
            xTickFormat,
            xTickGrid,
            yTickFormat,
            yTickGrid,
            yTicks,
            yTickSizeInner,
            yTickSizeOuter,
        } = properties;

        const distXDatas = d3.map(data, getXLabelFn()).keys().sort()

        let axist = {}

        axist.x = d3.axisBottom(getScale().x)
            .tickSizeInner(xTickGrid ? -availableHeight : xTickSizeInner)
            .tickSizeOuter(xTickSizeOuter);

        if (xTickFormat) {
            axist.x.tickFormat(d3.format(xTickFormat));
        }

        axist.x.tickValues(distXDatas);

        axist.y = d3.axisLeft(getScale().y)
            .tickSizeInner(yTickGrid ? -availableWidth : yTickSizeInner)
            .tickSizeOuter(yTickSizeOuter);

        if (yTickFormat) {
            axist.y.tickFormat(d3.format(yTickFormat));
        }

        if (yTicks) {
            axist.y.ticks(yTicks);
        }
        setGraphAxis(axist);
    }

    const getGraph = () => getSVG().select('.graph-container');

    const getMinGraph = () => getSVG().select('.mini-graph-container');

    // generate methods which helps to create charts
    const elementGenerator = () => {

        if (isEmpty(node)) return;

        getGraph().append("defs").append("clipPath")
            .attr("id", `clip${graphId}`)
            .append('rect')
    }

    // Update data on props change or resizing.
    const updateElements = () => {

        if (isEmpty(node)) return;

        const {
            xTickFontSize,
            yTickFontSize,
            yLabelLimit,
            xLabelRotate,
            xLabelLimit,
        } = properties;

        const svg = getGraph();

        svg.select(`#clip${graphId}`)
            .select("rect")
            .attr("x", -getYlabelWidth())
            .attr("width", availableWidth + getYlabelWidth())
            .attr("height", availableHeight);

        //Add the X Axis
        svg.select('.xAxis')
            .style('font-size', xTickFontSize)
            .attr('transform', 'translate(0,' + availableHeight + ')')
            .call(axis.x)
            .selectAll('.tick text')
            .call(wrapTextByWidth, { xLabelRotate, xLabelLimit });

        //Add the Y Axis
        const yAxis = svg.select('.yAxis')
            .style('font-size', yTickFontSize)
            .style('clip-path', `url(#clip${graphId})`)
            .call(axis.y);

        yAxis.selectAll('.tick text')
            .call(wrapD3Text, yLabelLimit);

        setAxisTitles();
        // check to enable/disable brushing
        if (isBrush()) {
            configureMinGraph()
        } else {
            getSVG().select('.brush').select('*').remove()
            getSVG().select('.min-heatmap').select('*').remove()
        }

        drawGraph({
            scale: getScale(),
            svg,
        })
    }

    const setAxisTitles = () => {
        const {
            xLabelSize,
            yLabel,
        } = properties;

        const axis = getSVG().select('.axis-title');

        if (xLabel) {
            axis.select('.x-axis-label')
                .attr('x', titlePosition.x.left)
                .attr('y', titlePosition.x.top)
                .style('font-size', `${xLabelSize}px`)
                .text(xLabel === true ? xColumn : xLabel);
        }

        if (yLabel) {
            axis.select('.y-axis-label')
                .attr('font-size', `${xLabelSize}px`)
                .attr('transform', `translate(${titlePosition.y.left}, ${titlePosition.y.top}) rotate(-90)`)
                .text(yLabel === true ? yColumn : yLabel);
        }
    }
    const getSVG = () => d3.select(node);

    const getMappedScaleColor = (data, defaultColumn) => {
        const {
            heatmapColor,
            otherColors,
            mapColors,
            colorColumn,
            mappedColors,
        } = properties;

        if (!colorColumn && !defaultColumn) {
            return;
        }

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

    const getLeftMargin = () => leftMargin;

    const setLeftMargin = () => (leftMargin = margin.left + getYlabelWidth())

    const getYlabelWidth = () => yLabelWidth;

    const setYlabelWidth = (data, yColumn = null) => {
        const {
            chartWidthToPixel,
            yTickFormat,
            yLabelLimit,
            appendCharLength,
        } = properties;

        yColumn = yColumn || 'yColumn';
        const yLabelFn = (d) => {
            if (yTickFormat === undefined || yTickFormat === null) {
                return d[yColumn];
            }
            const formatter = d3.format(yTickFormat);

            return formatter(d[yColumn]);
        };

        const labelLength = longestLabelLength(data, yLabelFn);
        setGraphYLabelWidth((labelLength > yLabelLimit ? yLabelLimit + appendCharLength : labelLength) * chartWidthToPixel);

    }

    const getColor = () => {
        const {
            legendColumn,
            emptyBoxColor,
            colors,
            stroke,
            colorColumn,
        } = properties;

        const colorScale = getMappedScaleColor(getFilterData(), legendColumn);

        return (d) => {
            let value = null
            if (d.hasOwnProperty(legendColumn)) {
                value = d[legendColumn];
            } else if (d.hasOwnProperty(colorColumn)) {
                value = d[colorColumn];
            } else if (d.hasOwnProperty("key")) {
                value = d["key"];
            }

            if (value === 'Empty') {
                return emptyBoxColor;
            }
            return colorScale ? colorScale(value) : stroke.color || colors[0];
        }

    }

    const getOpacity = (d) => {
        const {
            configuration,
            context,
            selectedData,
        } = properties;
        if (selectedData) {
            return selectedData[xColumn] === d[xColumn] && selectedData[yColumn] === d[yColumn] ? "1" : "0.5";
        }

        if (!context) {
            return 1;
        }

        let vkey = `${configuration.id.replace(/-/g, '')}vkey`;
        let keyValue = d => d[xColumn] + d[yColumn];

        return (!context[vkey] || context[vkey] === keyValue(d)) ? "1" : "0.5";
    }

    const drawGraph = ({
        scale,
        svg
    }) => {

        const {
            onMarkClick,
        } = properties;

        const {
            stroke,
            xAlign,
        } = properties;

        const box = getBoxSize()

        const cells = svg.select('.heatmap')
            .selectAll('.heatmap-cell')
            .data(getFilterData(), d => d[xColumn] + d[yColumn]);

        const newCells = cells.enter().append('g')
            .attr('class', 'heatmap-cell')
            .style('clip-path', `url(#clip${graphId})`);

        newCells.append('rect')
            .style('stroke', stroke.color)
            .style('stroke-width', stroke.width)
            .style('cursor', onMarkClick ? 'pointer' : '');

        const allCells = newCells.merge(cells);
        allCells.selectAll('rect')
            .style('fill', getColor())
            .style('opacity', d => getOpacity(d))
            .attr('x', d => scale.x(d[xColumn]) - (xAlign ? 0 : box.width / 2))
            .attr('y', d => scale.y(d[yColumn]) + scale.y.bandwidth() / 2 - box.height / 2)
            .attr('height', box.height)
            .attr('width', box.width)
            .attr("data-tip", true)
            .attr("data-for", id)
            .on('click', d => onMarkClick ? onMarkClick(d) : '')
            .on('mousemove', d => {
                setHoveredDataum(d);

            })
            .on('mouseleave', d => {
                setHoveredDataum(null);
            });
        cells.exit().remove();
    }

    const getScale = () => scale;

    const isBrushable = (data = []) => (brush = properties.brush && properties.brush < data.length);

    const isBrush = () => brush;

    const configureMinGraph = () => {
        const {
            brush,
            xAlign,
            stroke,
            brushColor,
        } = properties;

        const svg = getMinGraph(),
            scale = getScale(),
            minScale = { y: {} };

        let range, mainZoom;

        svg.attr('transform', `translate(${getMinMarginLeft()}, ${margin.top})`)

        mainZoom = d3.scaleLinear()
            .rangeRound([availableHeight, 0])
            .domain([0, availableHeight]);

        // Set scale for mini heatmap graph
        minScale.y = d3.scaleBand()
            .domain(scale.y.domain());

        minScale.y.rangeRound([availableHeight, 0]);

        range = [0, (availableHeight / getNestedYData().length) * brush];

        let brushing = d3.brushY()
            .extent([[0, 0], [getAvailableMinWidth(), availableHeight]])
            .on("brush end", () => {
                const scale = getScale(),
                    originalRange = mainZoom.range();

                let [start, end] = d3.event.selection || range;
                mainZoom.domain([end, start]);

                scale.y.rangeRound([mainZoom(originalRange[1]), mainZoom(originalRange[0])]);

                getGraph().select(".yAxis").call(axis.y);

                const box = getBoxSize();

                // re-render heatmap graph on brush end
                getGraph().selectAll(".heatmap-cell").selectAll("rect")
                    .attr('x', d => scale.x(d[xColumn]) - (xAlign ? 0 : box.width / 2))
                    .attr('y', d => scale.y(d[yColumn]) + box.height / 2 - box.height / 2)
                    .attr('height', box.height)
                    .attr('width', box.width);
            });

        svg.select(".brush")
            .call(brushing)
            .call(brushing.move, range);

        // Removes handle to resize the brush
        svg.selectAll('.brush>.handle').remove();
        // Removes crosshair cursor
        svg.selectAll('.brush>.overlay').remove();

        // Draw min heatmap cells
        const cells = svg.select('.min-heatmap')
            .selectAll('.heatmap-cell')
            .data(scale.y.domain());

        const newCells = cells.enter().append('g')
            .attr('class', 'heatmap-cell');

        newCells.append('rect')
            .style('stroke', stroke.color)
            .style('stroke-width', stroke.width);

        const allCells = newCells.merge(cells);

        allCells.selectAll('rect')
            .style('fill', brushColor)
            .attr('x', 0)
            .attr('y', d => minScale.y(d))
            .attr('height', (availableHeight / scale.y.domain().length))
            .attr('width', getAvailableMinWidth());

        // Remove all remaining nodes
        cells.exit().remove();
    }

    setLeftMargin();

    const graphStyle = {
        width: graphWidth,
        height: graphHeight,
        order: checkIsVerticalLegend(legend) ? 2 : 1,
    };

    if (!data || !data.length || !getFilterData().length)
        return renderMessage({
            id,
            message: 'No data to visualize',
            data,
        });

    const Tooltip = styled('div')({});

    return (
        <div className='heatmap-graph'>
            <Tooltip> {customTooltips.tooltipWrapper && customTooltips.tooltipWrapper(hoveredDatum)} </Tooltip>
            <div style={{ height, width, display: checkIsVerticalLegend(legend) ? 'flex' : 'inline-grid' }}>
                {renderLegend({
                    height,
                    width,
                    data,
                    legendArea,
                    fontColor,
                    circleToPixel,
                }, getCellColumnData(), legend, getColor(), (d) => d["key"], checkIsVerticalLegend(legend))}
                <div className='graphContainer' style={graphStyle}>
                    <svg width={graphWidth} height={graphHeight}>
                        <g ref={ref => node = ref}>
                            <g className='graph-container' transform={`translate(${getLeftMargin()},${margin.top})`}>
                                <g className='heatmap'></g>
                                <g className='xAxis'></g>
                                <g className='yAxis'></g>
                            </g>
                            <g className='mini-graph-container'>
                                <g className='min-heatmap'></g>
                                <g className='brush'></g>
                            </g>
                            <g className='axis-title'>
                                <text className='x-axis-label' textAnchor="middle"></text>
                                <text className='y-axis-label' textAnchor="middle"></text>
                            </g>
                            <g className='legend'></g>
                        </g>
                    </svg>
                </div>
            </div>
        </div>
    )
}

HeatmapGraph.propTypes = {
    configuration: PropTypes.object,
    data: PropTypes.array,
}

export default compose(
    WithValidationHOC(),
    (WithConfigHOC(properties))
)(HeatmapGraph);
