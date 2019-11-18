import PropTypes from 'prop-types';
import React from 'react';
import * as d3 from 'd3';
import isEqual from 'lodash/isEqual';

import { properties } from './default.config'
import XYGraph from '../XYGraph';

import { pick } from '../../utils/helpers';

const FILTER_KEY = ['data', 'height', 'width', 'context'];

class GroupBarGraph extends XYGraph {

    customExtent = [];
    nestedData = [];
    scale = {};

    constructor(props) {
        super(props, properties);
        this.initiate(this.props);
    }

    componentDidMount() {
        const {
            data
        } = this.props;

        if (!data || !data.length) {
            return;
        }

        this.updateElements();
    }

    shouldComponentUpdate(nextProps) {
        return !isEqual(pick(this.props, ...FILTER_KEY), pick(nextProps, ...FILTER_KEY));
    }

    componentDidUpdate(prevProps) {
        if (!isEqual(pick(prevProps, ...FILTER_KEY), pick(this.props, ...FILTER_KEY))) {
            this.initiate(this.props);
        }

        const {
            data
        } = this.props;

        if (!data || !data.length) {
            return;
        }

        this.updateElements();
    }

    initiate(props) {
        const {
            data
        } = props;

        if (!data || !data.length)
            return;

        this.parseData();
        this.setDimensions(props, data, 'total', this.getStackLabelFn());
        this.configureAxis({ data });
    }

    parseData() {
        const {
            xColumn,
            yColumn,
            stackColumn,
        } = this.getConfiguredProperties()

        if (this.isVertical()) {
            this.dimension = xColumn;
            this.metric = yColumn;
        } else {
            this.dimension = yColumn;
            this.metric = xColumn;
        }

        this.stack = stackColumn || this.dimension;
    }

    getStackLabelFn() {
        return (d) => d[this.stack];
    }

    getGraph() {
        return this.getSVG().select('.graph-container');
    }

    getStackLabelFn() {
        return (d) => d[this.stack];
    }

    getStack() {
        return this.stack;
    }

    setScale() {
        const {
            data
        } = this.props;

        const {
            colors
        } = this.getConfiguredProperties();

        const {
            graphWidth,
        } = this.getGraphDimension((d) => d, data);

        // The scale spacing the groups:
        this.scale.x0 = d3.scaleBand()
            .rangeRound([0, graphWidth - this.getMarginLeft()])
            .paddingInner(0.1);

        // The scale for spacing each group's bar:
        this.scale.x1 = d3.scaleBand()
            .padding(0.05);

        this.scale.y = d3.scaleLinear()
            .rangeRound([this.getAvailableHeight(), 0]);

        this.scale.z = d3.scaleOrdinal()
            .range(colors);
    }

    setAxis(data) {
        const {
            groupedKeys,
            yTickFormat,
            yTicks,
        } = this.getConfiguredProperties();
        this.scale.x0 = this.scale.x0.domain(data.map(this.getStackLabelFn()));
        this.scale.x1.domain(groupedKeys).rangeRound([0, this.scale.x0.bandwidth()]);
        this.scale.y.domain([0, d3.max(data, function (d) { return d3.max(groupedKeys, function (key) { return d[key]; }); })]).nice();

        if (yTickFormat) {
            this.scale.y.tickFormat(d3.format(yTickFormat));
        }

        if (yTicks) {
            this.scale.y.ticks(yTicks);
        }
    }

    // update elements on component mount
    updateElements() {
        const {
            xTickSizeInner,
            xTickSizeOuter,
            xTickGrid,
            yTickGrid,
            yTickSizeInner,
            yTickSizeOuter,
            yLabelLimit,
            xLabelLimit,
            xLabelRotate,
        } = this.getConfiguredProperties();

        const svg = this.getGraph();

        const xAxis = svg.select('.xAxis')
            .attr('transform', 'translate(0,' + this.getAvailableHeight() + ')')
            .call(d3.axisBottom(this.scale.x0).tickSizeInner(xTickGrid ? -this.getAvailableHeight() : xTickSizeInner)
                .tickSizeOuter(xTickSizeOuter));

        const yAxis = svg.select('.yAxis')
            .call(d3.axisLeft(this.scale.y).tickSizeInner(yTickGrid ? -this.getAvailableWidth() : yTickSizeInner)
                .tickSizeOuter(yTickSizeOuter).ticks(null, 's'));

        xAxis.selectAll('.tick text').call(this.wrapTextByWidth, { xLabelRotate, xLabelLimit });
        yAxis.selectAll('.tick text').call(this.wrapD3Text, yLabelLimit);

        this.setAxisTitles();

        this.drawGraph(svg);
    }

    drawGraph(svg) {

        const {
            data,
        } = this.props;

        const {
            legend,
            fontColor,
            circleToPixel,
            groupedKeys,
        } = this.getConfiguredProperties();

        const groupBars = svg.select('.graph-bars')
            .selectAll('.bar')
            .data(data);
        const newGroupBars = groupBars.enter().append('g')
            .attr('class', 'bar')
            .attr('transform', d => 'translate(' + this.scale.x0(d[this.getStack()]) + ',0)');

        const allGroupedBars = newGroupBars.merge(groupBars);

        allGroupedBars.selectAll('rect')
            .data(function (d) { return groupedKeys.map(function (key) { return { key: key, value: d[key] }; }); })
            .enter().append('rect')
            .attr('x', d => this.scale.x1(d.key))
            .attr('y', d => this.scale.y(d.value))
            .attr('width', this.scale.x1.bandwidth() - 1)
            .attr('height', (d) => this.getAvailableHeight() - this.scale.y(d.value))
            .attr('fill', (d) => this.scale.z(d.key));

        if (legend.show) {
            const {
                labelWidth,
            } = this.getGraphDimension((d) => d, data);

            const lineHeight = legend.circleSize * circleToPixel;

            const legends = d3.select('.legends')
                .selectAll('div')
                .data(groupedKeys.slice().reverse());

            const newLegend = legends.enter().append('div')
                .attr('height', lineHeight)
                .attr('width', labelWidth * 0.90);

            const finalLegend = newLegend.append('svg')
                .attr('class', "section")
                .attr('height', lineHeight)
                .attr('width', labelWidth);

            finalLegend.append("circle")
                .attr("cx", legend.circleSize)
                .attr("cy", legend.circleSize)
                .attr("r", legend.circleSize)
                .attr("fill", this.scale.z);

            finalLegend.append("text")
                .attr("x", legend.circleSize * 2 + legend.labelOffset)
                .attr("y", legend.circleSize + 5)
                .attr("alignmentBaseline", "baseline")
                .attr("fontSize", legend.labelFontSize)
                .attr("fontColor", fontColor)
                .text((d) => d);

            // Remove all remaining nodes        
            legends.exit().remove();
        }

        // Remove all remaining nodes        
        groupBars.exit().remove();
    }

    getMarginLeft() {
        return this.getLeftMargin() > 30 ? this.getLeftMargin() : this.getLeftMargin() * 1.5;
    }

    render() {
        const {
            data,
            width,
            height,
        } = this.props;

        if (!data || !data.length) {
            return this.renderMessage('No data to visualize');
        }

        const {
            margin,
            legend,
        } = this.getConfiguredProperties();

        const {
            graphHeight,
            graphWidth,
            legendWidth,
            legendHeight,
        } = this.getGraphDimension((d) => d, data);

        const graphStyle = {
            width: graphWidth,
            height: graphHeight,
            order: this.checkIsVerticalLegend() ? 2 : 1,
        };

        const legendContainerStyle = {
            width: legendWidth,
            height: legendHeight,
            display: this.checkIsVerticalLegend() ? 'grid' : 'inline-block',
            order: this.checkIsVerticalLegend() ? 1 : 2,
            overflow: 'auto',
        };

        return (
            <div className='group-bar-graph'>
                <div>{this.tooltip}</div>
                <div style={{ height, width, display: this.checkIsVerticalLegend() ? 'flex' : 'inline-grid' }}>
                    {
                        legend && legend.show &&
                        <div className='legendContainer' style={legendContainerStyle}>
                            <div className='legends' style={{ alignSelf: 'flex-end' }}>
                            </div>
                        </div>
                    }
                    <div className='graphContainer' style={graphStyle}>
                        <svg width={graphWidth} height={graphHeight}>
                            <g ref={node => this.node = node}>
                                <g className='graph-container' transform={`translate(${this.getMarginLeft()},${margin.top})`}>
                                    <g className='xAxis'></g>
                                    <g className='yAxis'></g>
                                    <g className='graph-bars'></g>
                                </g>
                                <g className='axis-title'>
                                    <text className='x-axis-label' textAnchor='middle'></text>
                                    <text className='y-axis-label' textAnchor='middle'></text>
                                </g>
                            </g>
                        </svg>
                    </div>
                </div>
            </div>
        )
    }
}

GroupBarGraph.propTypes = {
    configuration: PropTypes.object,
    data: PropTypes.arrayOf(PropTypes.object),
}

export default GroupBarGraph;
