import PropTypes from 'prop-types';
import React, { useEffect, useState } from "react"
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import {
    scaleBand,
    map,
    nest,
    extent,
    scaleTime,
    axisBottom,
    format,
    axisLeft,
    select,
    scaleOrdinal,
    scaleLinear,
    brushY,
    event
} from "d3"
import { compose } from 'redux';
import { styled } from '@material-ui/core/styles';

import WithConfigHOC from '../../HOC/WithConfigHOC';
import WithValidationHOC from '../../HOC/WithValidationHOC';
import { properties } from "./default.config"
import { nest as dataNest } from "../../utils/helpers/nest";
import { customTooltip }  from '../utils/helper';
import {
    renderLegend,
    getGraphDimension,
    checkIsVerticalLegend,
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
    let axist = {}

const getMappedScaleColor = (data, defaultColumn, properties) => {

    const {
        heatmapColor,
        otherColors,
        colorColumn,
        mappedColors,
    } = properties;

    if (!colorColumn && !defaultColumn) {
        return;
    }

    const domainData = map(data, (d) => d[colorColumn || defaultColumn]).keys().sort();
    const colors = Object.assign({}, heatmapColor || {}, mappedColors || {});

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

    const scale = scaleOrdinal(propColors);
    scale.domain(domainData);

    return scale;
}

const getColor = (properties) => {
  const {
      legendColumn,
      emptyBoxColor,
      colors,
      stroke,
      colorColumn,
  } = properties;

  const colorScale = getMappedScaleColor(getFilterData(), legendColumn, properties);

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

const getNestedYData = () => (nestedYData || []);

const getNestedXData = () => (nestedXData || []);

const getFilterData = () => (filterData || []);

const getLeftMargin = () => leftMargin;

const getCellColumnData = () => (cellColumnsData || []);

const getGraph = () => getSVG().select('.graph-container');

const getMinGraph = () => getSVG().select('.mini-graph-container');

const getSVG = () => node && select(node) || null;

const elementGenerator = (graphId) => {
  if (isEmpty(node)) return;

  getGraph().append("defs").append("clipPath")
      .attr("id", `clip${graphId}`)
      .append('rect')
}

const setAxisTitles = (properties) => {
  const {
      xLabelSize,
      yLabel,
      titlePosition,
      xLabel, 
      xColumn, 
      yColumn,
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

const isBrush = () => brush;

const setBoxSize = (properties) => {
  const {
      brush,
      availableHeight,
      availableWidth,
  } = properties;

  const height = availableHeight / (isBrush() ? brush : getNestedYData().length),
      width = availableWidth / getNestedXData().length;

  boxSize = { height, width };
}

const getBoxSize = () => (boxSize || 0);

const getOpacity = (d, properties) => {
  const {
      id,
      context,
      selectedData,
      xColumn,
      yColumn,
  } = properties;
  if (selectedData) {
      return selectedData[xColumn] === d[xColumn] && selectedData[yColumn] === d[yColumn] ? "1" : "0.5";
  }

  if (!context) {
      return 1;
  }

  let vkey = `${id.replace(/-/g, '')}vkey`;
  let keyValue = d => d[xColumn] + d[yColumn];

  return (!context[vkey] || context[vkey] === keyValue(d)) ? "1" : "0.5";
}

const getScale = () => scale;

const isBrushable = (data = [], properties) => (brush = properties.brush && properties.brush < data.length);

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
    const [showGraph, setShowGraph] = useState(false);

    useEffect(() => {
        initiate();
        elementGenerator(graphId);
        if(!isEmpty(axis) && !isEmpty(titlePosition)) {
            updateElements();
        }
        setCustomTooltips(customTooltip(properties));
    }, [props.data, props.height, props.width, props.context]);

    useEffect(() => {
        initiate();
        elementGenerator(graphId);
        setCustomTooltips(customTooltip(properties));
    }, []);

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
                top: availableHeight + chartHeightToPixel + getXAxisHeight() + (xLabelRotate ? xLabelRotateHeight : 0)
            },
            y: {
                left: margin.left + chartWidthToPixel,
                top: margin.top + availableHeight / 2
            }
        }));
    }

    const setBandScale = (data) => {
        bandScale.x = scaleBand().domain(map(data, getXLabelFn()).keys().sort());
        bandScale.x.rangeRound([0, availableWidth]);

        bandScale.y = scaleBand().domain(map(data, getYLabelFn()).keys().sort());
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
        let availableHeightT = (height - (chartHeightToPixel + getXAxisHeight()))* 0.80;
        
        setAvailableGraphHeight(availableHeightT);
    }

    const setAvailableWidth = (width) => {
        const {
            brushArea
        } = properties;
        let availableWidthT = width - (margin.left + margin.right + yLabelWidth);

        if (isBrush()) {
            availableWidthT = availableWidthT * (100 - brushArea) / 100
            availableMinWidth = width - (availableWidthT + getLeftMargin() + margin.left + margin.right);
            availableMinWidth = availableMinWidth > 10 ? availableMinWidth : 10;
            setMinMarginLeft(availableWidthT + getLeftMargin() + margin.left);
        }
        setAvailableGraphWidth(availableWidthT);
    }

    const getXLabelFn = () => ((d) => d[xColumn]);

    const getYLabelFn = () => ((d) => d[yColumn]);

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

        cellColumnsData = nest()
            .key((d) => legendColumn ? d[legendColumn] : "Cell")
            .entries(filteringData);

        if (filteringData.length) {
            isBrushable(nestedYData, properties);
        }

        if (!isEqual(filteringData, filterData)) {
            filterData = filteringData;
        }
    }

    const setScale = (data) => {
        const {
            xAlign
        } = properties

        const distXDatas = map(data, getXLabelFn()).keys().sort();
        const distYDatas = map(data, getYLabelFn()).keys().sort();

        const xValues = extent(data, getXLabelFn())
        const xPadding = distXDatas.length > 1 ? ((xValues[1] - xValues[0]) / (distXDatas.length - 1)) / 2 : 1

        setBoxSize({...properties, availableHeight, availableWidth});

        let minValue = xValues[0];
        let maxValue = xValues[1];

        if (xAlign) {
            maxValue += xPadding * 2;
        } else {
            minValue -= xPadding;
            maxValue += xPadding;
        }

        scale.x = scaleTime()
            .domain([minValue, maxValue])
            .range([0, availableWidth]);

        scale.y = scaleBand()
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

        const distXDatas = map(data, getXLabelFn()).keys().sort()

        axist.x = axisBottom(getScale().x)
            .tickSizeInner(xTickGrid ? -availableHeight : xTickSizeInner)
            .tickSizeOuter(xTickSizeOuter);

        if (xTickFormat) {
            axist.x.tickFormat(format(xTickFormat));
        }

        axist.x.tickValues(distXDatas);

        axist.y = axisLeft(getScale().y)
            .tickSizeInner(yTickGrid ? -availableWidth : yTickSizeInner)
            .tickSizeOuter(yTickSizeOuter);

        if (yTickFormat) {
            axist.y.tickFormat(format(yTickFormat));
        }

        if (yTicks) {
            axist.y.ticks(yTicks);
        }
        setGraphAxis(axist);
    }

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
            .attr("x", -yLabelWidth)
            .attr("width", availableWidth + yLabelWidth)
            .attr("height", availableHeight);

        svg.select('.xAxis')
            .style('font-size', xTickFontSize)
            .attr('transform', 'translate(0,' + availableHeight + ')')
            .call(axis.x)
            .selectAll('.tick text')
            .call(wrapTextByWidth, { xLabelRotate, xLabelLimit });

        const yAxis = svg.select('.yAxis')
            .style('font-size', yTickFontSize)
            .style('clip-path', `url(#clip${graphId})`)
            .call(axis.y);

        yAxis.selectAll('.tick text')
            .call(wrapD3Text, yLabelLimit);
        if(titlePosition.x.left !== margin.left) {
            setAxisTitles({ ...properties, titlePosition, xLabel, xColumn, yColumn });
        }

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

    const setLeftMargin = () => (leftMargin = margin.left + yLabelWidth)

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
            const formatter = format(yTickFormat);

            return formatter(d[yColumn]);
        };

        const labelLength = longestLabelLength(data, yLabelFn);
        setGraphYLabelWidth((labelLength > yLabelLimit ? yLabelLimit + appendCharLength : labelLength) * chartWidthToPixel);
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
            .style('fill', getColor(properties))
            .style('opacity', d => getOpacity(d, {...properties, xColumn, yColumn}))
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

        mainZoom = scaleLinear()
            .rangeRound([availableHeight, 0])
            .domain([0, availableHeight]);

        minScale.y = scaleBand()
            .domain(scale.y.domain());

        minScale.y.rangeRound([availableHeight, 0]);

        range = [0, (availableHeight / getNestedYData().length) * brush];

        let brushing = brushY()
            .extent([[0, 0], [getAvailableMinWidth(), availableHeight]])
            .on("brush end", () => {
                const scale = getScale(),
                    originalRange = mainZoom.range();

                let [start, end] = event.selection || range;
                mainZoom.domain([end, start]);

                scale.y.rangeRound([mainZoom(originalRange[1]), mainZoom(originalRange[0])]);

                getGraph().select(".yAxis").call(axis.y);

                const box = getBoxSize();

                getGraph().selectAll(".heatmap-cell").selectAll("rect")
                    .attr('x', d => scale.x(d[xColumn]) - (xAlign ? 0 : box.width / 2))
                    .attr('y', d => scale.y(d[yColumn]) + box.height / 2 - box.height / 2)
                    .attr('height', box.height)
                    .attr('width', box.width);
            });

        svg.select(".brush")
            .call(brushing)
            .call(brushing.move, range);

        svg.selectAll('.brush>.handle').remove();
        svg.selectAll('.brush>.overlay').remove();

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

        cells.exit().remove();
    }

    const graphStyle = {
        width: graphWidth,
        height: graphHeight,
        order: checkIsVerticalLegend(legend) ? 2 : 1,
    };

    if(getLeftMargin() !== margin.left && getLeftMargin() !== 0 && showGraph === false) {
        setShowGraph(true);
    } 
    
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
                }, getCellColumnData(), legend, getColor(properties), (d) => d["key"], checkIsVerticalLegend(legend))}
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
    data: PropTypes.array,
}

export default compose(
    WithValidationHOC(),
    (WithConfigHOC(properties))
)(HeatmapGraph);
