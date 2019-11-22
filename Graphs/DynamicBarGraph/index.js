import PropTypes from 'prop-types';
import React from 'react'
import * as d3 from 'd3'
import isEqual from 'lodash/isEqual';
import uniqBy from 'lodash/unionBy';
import ReactTooltip from "react-tooltip"

import { properties } from './default.config'
import XYGraph from '../XYGraph'
import "./style.css";

import { pick } from '../../utils/helpers';
import {dataParser, barWidth} from '../../utils/helpers/barGraph';

const FILTER_KEY = ['data', 'height', 'width', 'context']

class BarGraph extends XYGraph {

  customExtent = [];
  nestedData = [];
  startIndex = 0;
  endIndex = 0;

  constructor(props) {
    super(props, properties);
    this.initiate(this.props);
  }

  componentDidMount() {
    const {
      data
    } = this.props;
  
    if (!data || !data.length || (this.nestedData.length === 1 && this.nestedData[0].key === 'undefined')) {
      return
    }

    this.elementGenerator()
    this.updateElements()
  }

  shouldComponentUpdate(nextProps) {
    return !isEqual(pick(this.props, ...FILTER_KEY), pick(nextProps, ...FILTER_KEY))
  } 

  componentDidUpdate(prevProps) {
    if (!isEqual(pick(prevProps, ...FILTER_KEY), pick(this.props, ...FILTER_KEY))) {
      this.initiate(this.props);
    }

    const {
      data
    } = this.props;

    if (!data || !data.length || (this.nestedData.length === 1 && this.nestedData[0].key === 'undefined')) {
      return
    }
      
    this.updateElements()
  }

  getStackLabelFn() {
    return (d) => d[this.stack]
  }

  getMetricFn() {
    return (d) => d.total
  }

  // find min value (in case of others data, return sum of negative value)
  getMinFn() {
    return (d) => {
      return typeof d.min === 'undefined'
        ?
        d.values.reduce((total, curr) => {
          return total + parseFloat(curr[this.metric] < 0 ? curr[this.metric] : 0)
        }, 0)
       :
       d.min
    }
  }

  getMaxFn() {
    return (d) => typeof d.max === 'undefined' && d.total > 0 ? d.total : d.max
  }

  getDimensionFn() {
    return (d) => d.key
  }

  getGraph() {
    return this.getSVG().select('.graph-container')
  }

  getMinGraph() {
    return this.getSVG().select('.mini-graph-container');
  }

  initiate(props) {
    const {
      data
    } = props

    if (!data || !data.length)
        return

    this.parseData(props)
    this.setDimensions(props, this.getNestedData(), this.isVertical() ? 'total' : 'key', this.getStackLabelFn())
    this.configureAxis({
      data: this.getNestedData()
    })
  }

  parseData(props) {
    const {
      data
    } = props

    const {
      xColumn,
      yColumn,
      stackColumn,
      otherOptions,
      stackSequence,
      xTicksLabel,
      isSort
    } = this.getConfiguredProperties()
 
    if (this.isVertical()) {
      this.dimension = xColumn
      this.metric = yColumn
    } else {
      this.dimension = yColumn
      this.metric = xColumn
    }

    this.stack = stackColumn || this.dimension

    this.nestedData = dataParser({
      data,
      dimension: this.dimension,
      metric: this.metric,
      stack: this.stack,
      otherOptions,
      stackSequence,
      isSort
    });
  
    // check condition to apply brush on chart
    this.isBrushable(this.nestedData)
  }

  getNestedData() {
    return this.nestedData
  }

  getDimension() {
    return this.dimension
  }

  getStack() {
    return this.stack
  }

  // calculate range and make starting point from zero
  range(data) {
    this.customExtent = [d3.min(data, this.getMinFn()), d3.max(data, this.getMaxFn())]
    if(this.customExtent[0] > 0)
      this.customExtent[0] = 0

    if(this.customExtent[1] < 0)
      this.customExtent[1] = 0

    let difference = (this.customExtent[1] - this.customExtent[0]) * 0.05;

    if(this.customExtent[0] < 0)
      this.customExtent[0] = this.customExtent[0] - Math.abs(difference);

    if(this.customExtent[1] > 0)
      this.customExtent[1] = this.customExtent[1] + Math.abs(difference);

    return this.customExtent
}

  setScale(data) {
    const {
      dateHistogram,
      padding
    } = this.getConfiguredProperties()

    this.scale = {}
    
    if (dateHistogram) {

      // Handle the case of a vertical date histogram.
      this.scale.x = d3.scaleTime()
        .domain(d3.extent(data, this.getDimensionFn()))

        this.scale.y = d3.scaleLinear()
        .domain(this.range(data))

    } else if (this.isVertical()) {

      // Handle the case of a vertical bar chart.
      this.scale.x = d3.scaleBand()
        .domain(data.map(this.getDimensionFn()))
        .padding(padding)

      this.scale.y = d3.scaleLinear()
        .domain(this.range(data))

    } else {
      // Handle the case of a horizontal bar chart.
      this.scale.x = d3.scaleLinear()
        .domain(this.range(data))

      this.scale.y = d3.scaleBand()
        .domain(data.map(this.getDimensionFn()).reverse())
        .padding(padding)
    }

    this.scale.x.range([0, this.getAvailableWidth()])
    this.scale.y.range([this.getAvailableHeight(), 0])
  }

  // generate methods which helps to create charts
  elementGenerator() {
    
    const svg =  this.getGraph()

    svg.append("defs").append("clipPath")
      .attr("id", `clip${this.getGraphId()}`)
      .append('rect')

  }

  // update elements on component mount
  updateElements() {
    const {
      dateHistogram,
      yLabelLimit,
      xLabelLimit,
      xLabelRotate,
      xTickFontSize,
      margin
    } = this.getConfiguredProperties()

    const svg =  this.getGraph();
    svg.attr('transform', `translate(${this.getLeftMargin()},${margin.top})`)


    // set nested bar colors
    this.setColor()

    // set bar width
    this.setBarWidth()

    svg.select(`#clip${this.getGraphId()}`)
    .select("rect")
      .attr("x", this.isVertical() ? 0 : -this.getYlabelWidth())
      .attr("width", this.isVertical() ? this.getAvailableWidth() : this.getAvailableWidth() + this.getYlabelWidth())
      .attr("height", this.getAvailableHeight());

    //Add the X Axis
    const xAxis = svg.select('.xAxis')
      .style('clip-path',this.isVertical() ? `url(#clip${this.getGraphId()})` : null)
      .attr('transform', 'translate(0,'+ this.getAvailableHeight() +')')
      .call(this.getAxis().x)
      .selectAll('.tick text')
      .style('font-size', xTickFontSize)

      xAxis.call(this.wrapTextByWidth, { xLabelRotate, xLabelLimit })

    //Add the Y Axis
    const yAxis = svg.select('.yAxis')
      .call(this.getAxis().y)

    if(!this.isVertical())
      yAxis.style('clip-path', `url(#clip${this.getGraphId()})`)

    if(!this.isVertical() && !dateHistogram) {
      yAxis.selectAll('.tick text')
        .call(this.wrapD3Text, yLabelLimit)
    } 

    this.setAxisTitles()

    if(this.isBrush()) {
      this.configureMinGraph()
    } else {
      this.getSVG().select('.brush').select('*').remove()
      this.getSVG().select('.min-graph-bars').select('*').remove()
    }

    this.drawGraph({
      scale: this.getScale(),
      brush: false,
      svg
    })
  }

  setColor() {
    const {
      data
    } = this.props

    const {
      colorColumn,
      colors
    } = this.getConfiguredProperties()

    const scale = this.scaleColor(data, this.getStack())
    this.color =  (d) => scale ? scale(d[colorColumn || this.getStack()]) : colors[0]
  }

  getColor() {
    return this.color
  }

  setBarWidth() {
    const {
      dateHistogram,
      interval
    } = this.getConfiguredProperties()

    if (dateHistogram) {
      this.barWidth = barWidth(interval, this.getScale().x)
    } else if (this.isVertical()) {
      this.barWidth = this.getScale().x.bandwidth()
    }
  }

  getBarWidth() {
    return this.barWidth
  }

  getBarDimensions(scale) {

    return (
        this.isVertical() ? {
            x: d => scale.x(d.key),
            y: d => scale.y(d.y1 >= 0 ? d.y1 : d.y0),
            width: scale.x.bandwidth(),
            height: d => d.y1 >= 0 ? scale.y(d.y0) - scale.y(d.y1) : scale.y(d.y1) - scale.y(d.y0),
            initialY: d => scale.y(0),
            initialHeight: 0,
            get initialX() { return this.x},
            get initialWidth() { return this.width}
        } : {
            x: d => scale.x(d.y1 >= 0 ? d.y0 : d.y1),
            y: d => scale.y(d.key),
            width: d => d.y1 >= 0 ? scale.x(d.y1) - scale.x(d.y0) : scale.x(d.y0) - scale.x(d.y1),
            height: d => scale.y.bandwidth(),
            initialWidth: 0,
            initialX: d => scale.x(0),
            get initialY() { return this.y },
            get initialHeight() { return this.height }
        }
    )
  }

  drawGraph({
    scale,
    brush = false,
    svg
  }) {

    let self = this

    const {
      onMarkClick
    } = this.props

    const {
      stroke,
      otherOptions,
      loadSpeed
    } = this.getConfiguredProperties()

    const classPrefix = brush ? 'min-' : ''

    this.drawHorizontalLine(svg.select(`.${classPrefix}horizontal-line`), scale)

    // draw stacked bars
    const bars = svg.select(`.${classPrefix}graph-bars`)
      .selectAll(`.${classPrefix}bar-block`)
      .data(this.getNestedData(), d => d.key )

    const newBars = bars.enter().append('g')
      .attr('class', `${classPrefix}bar-block`)
      .style('clip-path', `url(#clip${this.getGraphId()})`)

    newBars.append('rect')
      .style('stroke', stroke.color)
      .style('stroke-width', stroke.width)
      .attr('class',"section")

    const allBars = newBars.merge(bars)
    const nestedBars = allBars.selectAll('rect')
      .data( d =>  d.values.map( datum => Object.assign(datum, {key: d.key} )))

    const newNestedBars = nestedBars.enter().append('rect')
    const allNestedbars = newNestedBars.merge(nestedBars)

    const {
      x,
      y,
      width,
      height,
      initialX,
      initialY,
      initialHeight,
      initialWidth
    } = this.getBarDimensions(scale)

    allNestedbars
      .style('cursor', onMarkClick ? 'pointer' : '')
      .style('fill', this.getColor())
      .attr('x', initialX)
      .attr('y', initialY)
      .attr('height', initialHeight)
      .attr('width', initialWidth)
      .attr("data-tip", true)
      .attr("data-for", this.tooltipId)
      .on('click', d => (
          onMarkClick && (!otherOptions || d[self.getDimension()] !== otherOptions.label)
          ?  onMarkClick(d) 
          : ''
        )
      )

      .transition()
       .duration(loadSpeed)//time in ms
        .attr('height', height)
        .attr('width', width)
        .attr('x', x)
        .attr('y', y)
        .on('end', function () {
          d3.select(this)
            .on('mousemove', d => {
                self.hoveredDatum = d
              }
            )
            .on("onMouseEnter", (d) => this.hoveredDatum = d)
            .on('mouseleave', this.hoveredDatum = null)
          })

          ReactTooltip.rebuild()    

    // Remove all remaining nodes        
    bars.exit().remove()
  }

  // draw line from which bars will be draw
  drawHorizontalLine(svg, scale) {

    if(this.customExtent.length && this.customExtent[0] < 0 && this.customExtent[1] > 0) {
      this.isVertical() ?
        svg.select("line")
        .attr("x1", 0)
        .attr("y1", scale.y(0))
        .attr("x2", this.getAvailableWidth())
        .attr("y2", scale.y(0))
      :
        svg.select("line")
        .attr("x1", scale.x(0))
        .attr("y1", 0)
        .attr("x2", scale.x(0))
        .attr("y2", this.getAvailableHeight())
    }
  }

  getStartIndex() {
    return this.startIndex;    
  }

  getEndIndex() {
    return this.endIndex;
  }

  configureMinGraph() {
    const {
      data
    } = this.props

    if (!data || !data.length)
      return

    const {
      margin,
      padding,
      brush,
      xLabelRotate,
      xLabelLimit,
    } = this.getConfiguredProperties()

    const svg   = this.getMinGraph(),
          scale = this.getScale(),
          minScale = { x: {}, y: {}}

    let range, brushXY, mainZoom

    if(this.isVertical()) {

      svg.attr('transform', `translate(${this.getLeftMargin()},${this.getMinMarginTop()})`)
      mainZoom = d3.scaleLinear()
        .range([0, this.getAvailableWidth()])
        .domain([0, this.getAvailableWidth()])

      minScale.x = d3.scaleBand()
        .domain(scale.x.domain())
        .padding(padding)

      minScale.y = d3.scaleLinear()
        .domain(scale.y.domain());

      minScale.x.range([0, this.getAvailableWidth()])
      minScale.y.range([this.getAvailableMinHeight(), 0])

      brushXY = d3.brushX()
        .extent([[0, 0], [this.getAvailableWidth(), this.getAvailableMinHeight()]])

      range = [this.getStartIndex(), this.getEndIndex() || (this.getAvailableWidth()/this.getNestedData().length) * brush]

    } else {

      svg.attr('transform', `translate(${this.getMinMarginLeft()},${margin.top})`)

      mainZoom = d3.scaleLinear()
        .range([this.getAvailableHeight(), 0])
        .domain([0, this.getAvailableHeight()])

      minScale.x = d3.scaleLinear()
        .domain(scale.x.domain())

      minScale.y = d3.scaleBand()
        .domain(scale.y.domain())
        .padding(padding);

      minScale.x.range([0, this.getAvailableMinWidth()])
      minScale.y.range([this.getAvailableHeight(), 0])

      range = [this.getStartIndex(), this.getEndIndex() || (this.getAvailableHeight()/this.getNestedData().length) * brush]

      brushXY = d3.brushY()
        .extent([[0, 0], [this.getAvailableMinWidth(), this.getAvailableHeight()]])
    }

    this.brushing = brushXY
      .on("brush end", () => {
        const scale = this.getScale(),
          originalRange = mainZoom.range()

        let [start, end] = d3.event.selection || range;

        this.startIndex = start;
        this.endIndex = end;

        if(this.isVertical()) {
          mainZoom.domain([start, end]);
          scale.x.range([mainZoom(originalRange[0]), mainZoom(originalRange[1])]);
          this.getGraph().select(".xAxis").call(this.getAxis().x)
          .selectAll('.tick text')
          .call(this.wrapTextByWidth, { xLabelRotate, xLabelLimit });
        } else {
          mainZoom.domain([end, start]);
          scale.y.range([mainZoom(originalRange[0]), mainZoom(originalRange[1])]);
          this.getGraph().select(".yAxis").call(this.getAxis().y);
        }

        const {
          x,
          y,
          width,
          height
        } = this.getBarDimensions(scale)

        this.getGraph().selectAll(".bar-block").selectAll("rect")
          .attr('x', x)
          .attr('y', y)
          .attr('width', width)
          .attr('height', height)

      });

    svg.select(".brush")
      .call(this.brushing)
      .call(this.brushing.move, range);

    // draw stacked bars
    this.drawGraph({scale: minScale, brush: true, svg})

  }

  render() {
    const {
      data,
      width,
      height
    } = this.props

    if (!data || !data.length || (this.nestedData.length === 1 && this.nestedData[0].key === 'undefined'))
      return this.renderMessage('No data to visualize')

    const {
      margin,
      legend,
      stackColumn
    } = this.getConfiguredProperties();

    const filterData = (stackColumn && uniqBy(data, stackColumn)) || data;

    {this.setColor()}

    const {
      graphHeight,
      graphWidth,
    } = this.getGraphDimension(this.getStackLabelFn());

    const graphStyle = {
      width: graphWidth,
      height: graphHeight,
      order:this.checkIsVerticalLegend() ? 2 : 1,
    };

    return (
      <div className='dynamic-bar-graph'>
        <div>{this.tooltip}</div>
        <div style={{ height, width,  display: this.checkIsVerticalLegend() ? 'flex' : 'inline-grid'}}>
          {this.renderLegend(filterData, legend, this.getColor(), this.getStackLabelFn(), this.checkIsVerticalLegend())}
          <div className='graphContainer' style={ graphStyle }>
            <svg width={graphWidth} height={graphHeight}>
              <g ref={node => this.node = node}>
                <g className='graph-container' transform={`translate(${this.getLeftMargin()},${margin.top})`}>
                  <g className='xAxis'></g>
                  <g className='yAxis'></g>
                  <g className='horizontal-line'>
                    <line className='line' style={{stroke: 'black', strokeWidth: '0.4'}}></line>
                  </g>
                  <g className='graph-bars'></g>
                </g>
                <g className='mini-graph-container'>
                  <g className='min-horizontal-line'>
                    <line className='line' style={{stroke: 'black', strokeWidth: '0.4'}}></line>
                  </g>
                  <g className='min-graph-bars'></g>
                  <g className='xAxis'></g>
                  <g className='yAxis'></g>
                  <g className='brush'></g>
                </g>
                <g className='axis-title'>
                  <text className='x-axis-label' textAnchor="middle"></text>
                  <text className='y-axis-label' textAnchor="middle"></text>
                </g>
              </g>
            </svg>
          </div>  
        </div>
      </div>  
    )
  }
}

BarGraph.propTypes = {
  configuration: PropTypes.object,
  data: PropTypes.arrayOf(PropTypes.object)
}

export default BarGraph
