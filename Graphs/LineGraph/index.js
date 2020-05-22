import PropTypes from 'prop-types';
import React from "react";
import {
    axisBottom,
    axisLeft,
    extent,
    format,
    scaleLinear,
    scaleTime,
    select,
    voronoi,
    merge,
    timeFormat
} from "d3";
import moment from 'moment';
import momentDuration from 'moment-duration-format';
import isEqual from 'lodash/isEqual';
import * as d3 from 'd3'
import isEmpty from 'lodash/isEmpty';
import ReactTooltip from 'react-tooltip';

import XYGraph from "../XYGraph";
import { pick } from "../../utils/helpers";
import { nest } from "../../utils/helpers/nest";
import {properties} from "./default.config";

momentDuration(moment);

const duration = "duration";
const FILTER_KEY = ['data', 'height', 'width', 'context'];
class LineGraph extends XYGraph {

    yKey   = 'columnType'
    yValue = 'yColumn'

    constructor(props) {
        super(props, properties);
        this.brushed = 0;
        this.xAxis = 0;
        this.lineGenerator = 0;
        this.scaleX = 0;
        this.availableHeight = 0;
        this.availableWidth = 0;
        this.availableMinHeight = 0;
        this.graphId = new Date().valueOf();
        this.leftMargin = 0;
        this.miniGraphXScale = 0;
        this.startIndex = 0;
        this.endIndex = 0;

        this.state = {
            configuredProperties: this.configuredProperties
        }
    }

    shouldComponentUpdate(nextProps) {
        return !isEqual(pick(this.props, ...FILTER_KEY), pick(nextProps, ...FILTER_KEY)) ||
            !isEqual(this.props.configuration, nextProps.configuration) ||
            !isEqual(this.configuredProperties, this.state.configuredProperties);
    } 
    
    componentDidUpdate(prevProps) {
        const {
            data
        } = this.props;

        if (!data || !data.length) {
            return
        }

        if (!isEqual(prevProps.configuration.data, this.props.configuration.data)) {
            this.setConfiguredProperties(this.props, this.properties);
            this.setTooltip();
            this.setState({configuredProperties: this.configuredProperties});
        }

        this.updateElements(); 

        ReactTooltip.rebuild();
    }

    componentDidMount() {
        const {
            data
        } = this.props;

        const {
            brushEnabled
        } = this.getConfiguredProperties();

        if (!data || !data.length) {
            return
        }
        if (brushEnabled) {
            this.elementGenerator();
            this.updateElements();
        }
    }

    getGraph() {
        return d3.select('.graph-container');
    }

    elementGenerator() {
        const svg = this.getGraph();
        svg.append("defs").append("svg:clipPath")
            .attr("id", `clips${this.graphId}`)
            .append("svg:rect")
            .attr("width", this.availableWidth)
            .attr("height", this.availableHeight + 2.25 * this.getXAxisHeight())
            .attr("x", 0)
            .attr("y", 0);
    }

    updateElements() {
        const miniGraph = d3.select('.mini-graph-container');
        const line = d3.select('.graph-container');
        const {
            xLabelRotate,
            xLabelLimit,
            xTickFontSize,
        } = this.getConfiguredProperties();

        let range = [this.getStartIndex(), this.getEndIndex() || this.availableWidth];
        const brush = d3.brushX()
        .extent([[0, 0], [this.availableWidth, this.availableMinHeight]])
        .on("brush end", () => {
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
            this.linesData.map((d, i) => {
                d.key = d.key || `line${i}`;
                const lineScale = d3.event.selection || range;
                let [start, end] = lineScale;
                this.startIndex = start;
                this.endIndex = end;
                this.scaleX.domain(lineScale.map(this.miniGraphXScale.invert, this.miniGraphXScale));
                line.select('.line').select(`.${d.key}`).attr("d", this.lineGenerator(d.values));
                line.select('.axis--x').call(this.xAxis).selectAll('.tick text')
                    .style('font-size', xTickFontSize)
                    .call(this.wrapTextByWidth, { xLabelRotate, xLabelLimit });
            });
        });    

        miniGraph.select(".brush")
            .call(brush)
            .call(brush.move, range);     
    }

    getStartIndex() {
        return this.startIndex;
    }

    getEndIndex() {
        return this.endIndex;
    }

    render() {
        const {
            data,
            width,
            height
        } = this.props;

        if (!data || !data.length)
            return this.renderMessage('No data to visualize')

        if (isEmpty(this.state.configuredProperties)) {
            return null;
        }

        const {
          chartHeightToPixel,
          chartWidthToPixel,
          colors,
          dateHistogram,
          legend,
          linesColumn: configLinesColumn,
          margin,
          stroke,
          xColumn,
          xLabel,
          xTickFormat,
          xTickGrid,
          xTicks,
          xTickSizeInner,
          xTickSizeOuter,
          yColumn,
          yTickFormat,
          yTickFormatType,
          yTickGrid,
          yTicks,
          yTickSizeInner,
          yTickSizeOuter,
          brushEnabled,
          circleRadius,
          defaultY,
          defaultYColor,
          showNull,
          yLabelLimit,
          appendCharLength,
          xLabelRotate,
          xLabelLimit,
          xLabelRotateHeight,
          yTickFontSize,
          xTickFontSize,
          yTicksLabel,
          connected,
        } = this.state.configuredProperties;

        let finalYColumn = typeof yColumn === 'object' ? yColumn : [yColumn];

        let updatedLinesLabel = [];

        let linesColumn = configLinesColumn || [yColumn];

        const colorList = {};
        const getColorList = (linesColumn) => {
            const keyList = [];
            linesColumn.forEach(lineList => {
                if (typeof lineList === 'object') {
                    colorList[lineList['key']] = lineList['color'];
                    keyList.push(lineList['key']);
                }
            });

            if (keyList.length === 0) {
                return linesColumn;
            }
            return keyList;
        }

        if(linesColumn) {
            updatedLinesLabel = typeof linesColumn === 'object' ? getColorList(linesColumn) : [linesColumn];
        }

        let legendsData = updatedLinesLabel.map((d, i) => {
            return {
                'key'   : d,
                'value' : finalYColumn[i] ? finalYColumn[i] : d
            }
        })

        let flatData = []
        data.forEach((d) => {
            if(!dateHistogram || d[xColumn] <= Date.now()) {
                legendsData.forEach((ld) => {

                    let key = typeof linesColumn === 'object' ? ld['key'] : d[ld['key']]
                    if(typeof key === "object" || key === "") {
                        return
                    }

                    flatData.push(Object.assign({
                        [this.yValue]: d[ld['value']],
                        [this.yKey]: key
                    }, d));
                });
            }
        });

        // Nesting data on the basis of yAxis
        let nestLinesData = nest({
            data: flatData,
            key: this.yKey
        })

        // Nesting data on the basis of xAxis (timestamp)
        let nestedXData = nest({
            data: flatData,
            key: xColumn,
            sortColumn: xColumn
        })

        let linesData = []
        // Check x column data, if not found either skip or set to 0 (if showNull is true)
        nestLinesData.forEach(item => {

            let d = Object.assign({}, item)
            let counter = 0
            let elem = null

            elem = {
                key: `${item.key}${counter}`,
                values: []
            }
            // Inserting new object if data not found
            nestedXData.forEach(list => {
                let index = (d.values).findIndex(o => {
                   return `${o[xColumn]}` === `${list.key}`
                })

                if(index !== -1
                    && d.values[index][this.yValue] !== ""
                    && typeof d.values[index][this.yValue] !== 'undefined'
                    && typeof d.values[index][this.yValue] !== 'object'
                ) {
                    elem.values.push(d.values[index])
                } else if (!connected) {
                  // If showNull is true, insert new object with yValue=0
                    if(showNull !== false) {
                        elem.values.push({
                            [this.yValue]: 0,
                            [this.yKey]: d.key,
                            [xColumn]: list.key
                        })
                    } else {
                        // Make new truncated line if yValue is null
                        if(elem.values.length) {
                            linesData.push(elem)
                            counter++;
                            elem = {
                                key: `${item.key}${counter}`,
                                values: []
                            }
                        }
                    }
                }
            })

            if(elem.values.length) {
                linesData.push(elem)
            }
        })

        if(!linesData.length) {
            return (
                <div style={{paddingTop: '10px', textAlign: 'center'}}>
                    No data to display
                </div>
            )
        }

        let filterDatas = merge(linesData.map(function(d) { return d.values; }))

        const xLabelFn         = (d) => parseFloat(d[xColumn])
        const yLabelFn         = (d) => parseFloat(d[this.yValue]);
        const label            = (d) => d[this.yKey];

        const scale = this.scaleColor(filterDatas, this.yKey);
        const getColor = (d) => {
            if (colorList && colorList[d[this.yKey]]) {
                return colorList[d[this.yKey]];
            }
            return scale ? scale(d[this.yKey] || d["key"]) : stroke.color || colors[0]
        };

        const {
            graphHeight,
            graphWidth,
        } = this.getGraphDimension(label, filterDatas);

        let xAxisHeight       = xLabel ? chartHeightToPixel : 0;

        let yLabelWidth = 0;
        if (yTicksLabel && typeof yTicksLabel === 'object') {
            yLabelWidth = this.longestLabelLength(Object.values(yTicksLabel));
        } else {
            yLabelWidth = this.longestLabelLength(filterDatas, yLabelFn, (yTickFormatType !== duration) ? yTickFormat : null);
        }

        yLabelWidth = (yLabelWidth > yLabelLimit ?  yLabelLimit + appendCharLength : yLabelWidth)* chartWidthToPixel
        let leftMargin        = margin.left + yLabelWidth;
        let availableWidth    = graphWidth - (margin.left + margin.right + yLabelWidth);
        let availableHeight   = graphHeight - (margin.top + margin.bottom + chartHeightToPixel + xAxisHeight);

        if (brushEnabled) {
            availableHeight = availableHeight * 0.75;
            this.availableMinHeight = height - (availableHeight + (margin.top * 4) + margin.bottom + chartHeightToPixel + this.getXAxisHeight());
        }

        if (xLabelRotate) {
            availableHeight -= xLabelRotateHeight;
        }

        let range = extent(filterDatas, yLabelFn)

        let yExtent = this.updateYExtent(range);
        let xScale, miniGraphXScale;

        if (dateHistogram) {
            xScale = scaleTime();
            miniGraphXScale = scaleTime();
        } else {
            xScale = scaleLinear();
            miniGraphXScale = scaleLinear();
        }

        let xExtent = extent(filterDatas, xLabelFn);

        //Adding 1 Minute to both side, if only one timestamp is there
        if(xExtent[0] === xExtent[1]) {

            //Checking Time format either Year or Milliseconds - therefore adding 4 years or 1 HR respectively
            let adder = xExtent[1].toString().length === 4 ? 4 : 3600000;
            xExtent[0] -= adder
            xExtent[1] += adder
        }

        xScale.domain(xExtent);
        miniGraphXScale.domain(xExtent);        

        const yScale = scaleLinear()
          .domain(yExtent);
        
        xScale.range([0, availableWidth]);
        miniGraphXScale.range([0, availableWidth]);
        yScale.range([availableHeight, 0]);
        
        const miniGraphYScale = scaleLinear()
        .domain(yExtent);
        
        miniGraphYScale.range([this.availableMinHeight, 0]);

        // calculate new range from defaultY
        let horizontalLine,
        defaultYvalue,
        horizontalLineData

        if(defaultY) {

            defaultYvalue = defaultY
            let [startRange, endRange] = yScale.domain()

            if(typeof defaultY === 'object' && defaultY.column) {
                const dataSource = defaultY.source || 'data'
                horizontalLineData = this.props[dataSource] && this.props[dataSource].length ? this.props[dataSource][0] : {}
                defaultYvalue = horizontalLineData[defaultY.column] || null
            }
            startRange = startRange > defaultYvalue ? Math.floor(defaultYvalue / 10) * 10 : startRange
            endRange = endRange < defaultYvalue ? Math.ceil(defaultYvalue / 10) * 10 : endRange
            yScale.domain([startRange, endRange]);

        }

        const xAxis = axisBottom(xScale)
          .tickSizeInner(xTickGrid ? -availableHeight : xTickSizeInner)
          .tickSizeOuter(xTickSizeOuter);

        const miniGraphXAxis = axisBottom(miniGraphXScale)
          .tickSizeInner(xTickGrid ? -availableHeight : xTickSizeInner)
          .tickSizeOuter(xTickSizeOuter);

        if(xTickFormat){
            xAxis.tickFormat(dateHistogram ? timeFormat(xTickFormat) : format(xTickFormat));
            miniGraphXAxis.tickFormat(dateHistogram ? timeFormat(xTickFormat) : format(xTickFormat))
        }

        if(xTicks){
            xAxis.ticks(xTicks);
            miniGraphXAxis.ticks(xTicks);
        }

        const yAxis = axisLeft(yScale)
          .tickSizeInner(yTickGrid ? -availableWidth : yTickSizeInner)
          .tickSizeOuter(yTickSizeOuter);

        if (yTickFormat || yTickFormat === "") {
            const yAxisTickFormat = (yTickFormatType === duration) ? (d) => moment.duration(d).format(yTickFormat, { trim: false }) : format(yTickFormat);
            yAxis.tickFormat(yAxisTickFormat);
        }

        if(yTicks){
            yAxis.ticks(yTicks);
        }

        if (yTicksLabel && typeof yTicksLabel === 'object') {
            yAxis.tickValues(Object.keys(yTicksLabel));
            yAxis.tickFormat( value => yTicksLabel[value] || null);
        }

        const lineGenerator = d3.line()
          .x( d => xScale(d[xColumn]))
          .y( d => yScale(d[this.yValue]));

        const lineGenerator2 = d3.line()
          .x( d => xScale(d[xColumn]))
          .y( d => miniGraphYScale(d[this.yValue])); 
         
        const xTitlePostionTop = margin.top + availableHeight + chartHeightToPixel + xAxisHeight + ( xLabelRotate ? xLabelRotateHeight : 0); 

        let xTitlePosition = {
            left: leftMargin + availableWidth / 2,
            top: brushEnabled ? xTitlePostionTop + this.availableMinHeight + chartHeightToPixel*1.25 + xAxisHeight : xTitlePostionTop
        }

        let yTitlePosition = {
            // We use chartWidthToPixel to compensate the rotation of the title
            left: margin.left + chartWidthToPixel, 
            top: margin.top + availableHeight / 2
        }

        const tooltipOverlay = voronoi()
            .x( d => xScale(d[xColumn]))
            .y(availableHeight)
            .extent([[-leftMargin, -margin.top], [availableWidth + margin.right, availableHeight + margin.bottom]])
            .polygons(filterDatas)

        const tooltipOffset = (d) => JSON.stringify({
                'bottom': margin.top + yScale(d[this.yValue]),
                'right': xScale(d[xColumn]) + leftMargin
            });

        //draw horizontal line
        if(defaultYvalue) {
            let y = yScale(defaultYvalue),
            height = 20,
            tooltip = []

            if(horizontalLineData && defaultY.tooltip) {
                tooltip = this.tooltipProps(Object.assign({}, horizontalLineData ,{tooltipName: 'defaultY'}))
            }

            horizontalLine = (
                <g>
                    <rect
                        height={height}
                        width={availableWidth}
                        x="0"
                        y={ y - height/2}
                        opacity="0"
                        { ...tooltip }
                    />
                    <line
                        x1="0"
                        y1={y}
                        x2={availableWidth}
                        y2={y}
                        stroke={ defaultYColor ? defaultYColor : "rgb(255,0,0)"}
                        strokeWidth="1.5"
                        opacity="0.7"
                        className="horizontalLine"
                    />
                </g>
            )
        }


        let defaultLine =
            range[0] < 0 && range[1] > 0 ?
                <line
                    x1="0"
                    y1={yScale(0)}
                    x2={availableWidth}
                    y2={yScale(0)}
                    stroke={ "rgb(0,0,0)"}
                    opacity="0.3"
                />
                : '';

        const graphStyle = {
            width: graphWidth,
            height: graphHeight,
            order:this.checkIsVerticalLegend() ? 2 : 1,
        };    
           
        this.xAxis = xAxis;
        this.lineGenerator = lineGenerator;
        this.scaleX = xScale;
        this.availableHeight = availableHeight;
        this.availableWidth = availableWidth;
        this.leftMargin = leftMargin;
        this.miniGraphXScale = miniGraphXScale;
        this.linesData = linesData;

        const getMinMarginTop = () => {
            const {
                chartHeightToPixel,
                margin
            } = this.getConfiguredProperties();
    
            return this.availableHeight + (margin.top * 2.5) + chartHeightToPixel + this.getXAxisHeight();
        }
        
        return (
            <div className="line-graph">
                <div style={{ height, width,  display: this.checkIsVerticalLegend() ? 'flex' : 'inline-grid'}}>
                    {this.renderLegend(filterDatas, legend, getColor, label, this.checkIsVerticalLegend())}
                    <div className='graphContainer' style={ graphStyle }>
                        <svg width={graphWidth} height={graphHeight}>
                            {this.axisTitles(xTitlePosition, yTitlePosition)}
                                <g className='graph-container' transform={ `translate(${leftMargin},${margin.top})` } >
                                    <g className='axis axis--x'
                                        key="xAxis"
                                        ref={ (el) => select(el).call(xAxis)
                                            .selectAll('.tick text')
                                            .style('font-size', xTickFontSize)
                                            .call(this.wrapTextByWidth, { xLabelRotate, xLabelLimit }) 
                                        }
                                        transform={ `translate(0,${availableHeight})` }
                                    />
                                    <g className='axis axis--y'
                                        key="yAxis"
                                        ref={ (el) => select(el)
                                            .call(yAxis)
                                            .selectAll('.tick text')
                                            .call(this.wrapD3Text, yLabelLimit)
                                        }
                                    />

                                    <g className='line' style={{"clipPath": `url(#clips${this.graphId})`}}>
                                    {linesData.map((d, i) =>
                                        (d.values.length === 1) ?
                                            <circle key={d.key} cx={xScale(d.values[0][xColumn])} cy={yScale(d.values[0][this.yValue])} r={circleRadius} fill={getColor(d.values[0])} />
                                        :
                                        <path
                                            key={ d.key }
                                            className={ d.key || `line${i}`}
                                            fill="none"
                                            stroke={ getColor(d.values[0] || d) }
                                            strokeWidth={ stroke.width }
                                            d={ lineGenerator(d.values) }

                                        />
                                    )}
                                    </g>
                                    <g className= {"lineGraph"}>
                                    {tooltipOverlay.map((d, i) =>
                                        <g
                                            key={ i }
                                            { ...this.tooltipProps(d.data) }
                                            offset={tooltipOffset(d.data)}
                                        >

                                            /*
                                                This rectangle is a hack
                                                to position tooltips correctly.
                                                Due to this rectangle, the boundingClientRect
                                                used by ReactTooltip for positioning the tooltips
                                                has an upper left corner at (0, 0).
                                            */
                                            <rect
                                                x={-leftMargin}
                                                y={-margin.top}
                                                width="1"
                                                height="1"
                                                fill="none"
                                            />

                                            <path
                                                key={ i }
                                                fill="none"
                                                d={ d == null ? null : "M" + d.join("L") + "Z" }
                                                style={{"pointerEvents": "all", "opacity": 0.5}}
                                            />
                                        </g>
                                    )}
                                    </g>
                                    { defaultLine }
                                    { horizontalLine }
                                </g>
                                { brushEnabled &&
                                <g className="mini-graph-container" transform={ `translate(${leftMargin},${getMinMarginTop()})`} > 
                                    {linesData.map((d, i) =>
                                        (d.values.length === 1) ?
                                            <circle key={d.key} cx={xScale(d.values[0][xColumn])} cy={yScale(d.values[0][this.yValue])} r={circleRadius} fill={getColor(d.values[0])} />
                                        :
                                        <path
                                            key={ d.key }
                                            fill="none"
                                            stroke={ getColor(d.values[0] || d) }
                                            strokeWidth={ stroke.width }
                                            d={ lineGenerator2(d.values) }

                                        />
                                    )}
                                    <g className='axis'
                                        key="xAxis"
                                        ref={ (el) => select(el).call(miniGraphXAxis)
                                            .selectAll('.tick text')
                                            .style('font-size', xTickFontSize)
                                            .call(this.wrapTextByWidth, { xLabelRotate, xLabelLimit }) 
                                        }
                                        transform={ `translate(0,${this.availableMinHeight})` }
                                    />
                                   <g className='brush'></g>
                                </g>}  
                        </svg>
                    </div>
                </div> 
                <div>{this.tooltip}</div>
            </div>       
        );
    }
}
LineGraph.propTypes = {
  configuration: PropTypes.object,
  response: PropTypes.object
};

export default LineGraph
