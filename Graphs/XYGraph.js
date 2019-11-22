import PropTypes from 'prop-types';
import React from "react";
import AbstractGraph from "./AbstractGraph";

import {
    format,
    scaleTime,
    extent,
    scaleLinear,
    axisBottom,
    axisLeft,
    scaleBand,
    map
} from "d3";

export default class XYGraph extends AbstractGraph {

    constructor(props, properties = {}) {
        super(props, properties);
    }

    writeYLabel(x, y) {
        
    }

    writeXLabel(x, y) {
        
    }

    configureAxis({data, customYColumn = null}) {
        this.setBandScale(data, customYColumn)
        this.setScale(data, customYColumn)
        this.setAxis(data);
        this.setTitlePositions();
    }

    setBandScale(data, customYColumn) {
        const {
          xColumn,
          yColumn
        } = this.getConfiguredProperties();

        this.bandScale  = {};
        const xLabelFn  = (d) => d[xColumn];
        const yLabelFn  = (d) => d[customYColumn ? customYColumn : yColumn];

        const distXDatas = map(data, xLabelFn).keys().sort();
        const distYDatas = map(data, yLabelFn).keys().sort();

        this.bandScale.x = scaleBand()
            .domain(distXDatas);

        this.bandScale.x.rangeRound([0, this.getAvailableWidth()]);

        this.bandScale.y = scaleBand()
          .domain(distYDatas);

        this.bandScale.y.rangeRound([0, this.getAvailableHeight()]);
    }

    getBandScale() {
      return this.bandScale;
    }

    setScale(data, customYColumn) {
        if (!data || !data.length)
            return;

        const {
          dateHistogram,
          xColumn,
          yColumn,
        } = this.getConfiguredProperties();

        const xLabelFn = (d) => d[xColumn];
        const yLabelFn = (d) => parseFloat(d[customYColumn ? customYColumn : yColumn]);
        const yExtent  = this.updateYExtent(extent(data, yLabelFn));

        this.scale = {};

        if (dateHistogram) {
            this.scale.x = scaleTime()
              .domain(extent(data, xLabelFn));
        } else {
            this.scale.x = scaleLinear()
              .domain(extent(data, xLabelFn));
        }

        this.scale.x.range([0, this.getAvailableWidth()]);

        this.scale.y = scaleLinear()
            .domain(yExtent);
        
        this.scale.y.range([this.getAvailableHeight(), 0]);
    }

    getScale() {
        return this.scale;
    }

    setAxis(data) {

        if (!data || !data.length)
            return;

        const {
            xTickSizeInner,
            xTickSizeOuter,
            xTickFormat,
            xTickGrid,
            xTicks,
            yTickFormat,
            yTickGrid,
            yTicks,
            yTickSizeInner,
            yTickSizeOuter,
            xTicksLabel
        } = this.getConfiguredProperties();

        this.axis = {};

        // X axis
        this.axis.x = axisBottom(this.getScale().x)
            .tickSizeInner(xTickGrid ? -this.getAvailableHeight() : xTickSizeInner)
            .tickSizeOuter(xTickSizeOuter);

        if (xTicksLabel && typeof xTicksLabel === 'object') {
            const externalTicksLable = {};
            const xTicksLabelValue = data.map((barData) => {
                if (!Object.keys(xTicksLabel).includes(barData.key.toString())) {
                    externalTicksLable[barData.key] = barData.key;
                }
                return barData.key;
            });

            const finalTikcLabel = { ...xTicksLabel, ...externalTicksLable }

            this.axis.x
                .tickValues(xTicksLabelValue)
                .tickFormat(value => finalTikcLabel[value]);
        } else if(xTickFormat){
            this.axis.x.tickFormat(format(xTickFormat));
        }

        if(xTicks){
            this.axis.x.ticks(xTicks);
        }
        
        // Y axis
        this.axis.y = axisLeft(this.getScale().y)
            .tickSizeInner(yTickGrid ? -this.getAvailableWidth() : yTickSizeInner)
            .tickSizeOuter(yTickSizeOuter);

        if(yTickFormat){
            this.axis.y.tickFormat(format(yTickFormat));
        } else if (yTickFormat === "") {
            const yAxisTicks = this.getScale().y.ticks()
                .filter(tick => Number.isInteger(tick));
            this.axis.y
                .tickValues(yAxisTicks)
                .tickFormat(format('d'));
        }

        if(yTicks){
            this.axis.y.ticks(yTicks);
        }
    }

    getAxis() {
        return this.axis;
    }

    setTitlePositions() {
      const {
            chartHeightToPixel,
            chartWidthToPixel,
            margin,
            xLabelRotate,
            xLabelRotateHeight,
        } = this.getConfiguredProperties();

        this.titlePosition = {
            x: {
              left: this.getLeftMargin() + this.getAvailableWidth() / 2,
              top: (this.isBrush() && this.isVertical())
                ?  margin.top + margin.bottom + this.getMinMarginTop() + this.getAvailableMinHeight()
                :  margin.top + this.getAvailableHeight() + chartHeightToPixel + this.getXAxisHeight() + (xLabelRotate ? xLabelRotateHeight : 0)
            },
            y: {
              left: margin.left + chartWidthToPixel,
              top: margin.top + this.getAvailableHeight() / 2
            }
        }
    }

    getTitlePositions() {
        return this.titlePosition;
    }

    axisTitles(xLabelPosition, yLabelPosition) {

        const {
          xColumn,
          xLabel,
          xLabelSize,
          yColumn,
          yLabel,
          yLabelSize,
        } = this.getConfiguredProperties();

        return (
            <g>
                { xLabel ? (
                    <text
                        className="axis-label"
                        x={ xLabelPosition.left }
                        y={ xLabelPosition.top }
                        textAnchor="middle"
                        fontSize={xLabelSize + "px"}
                    >
                      { xLabel === true ? xColumn : xLabel}
                    </text>
                  ) : null
                }
                { yLabel ? (
                    <text
                        className="axis-label"
                        transform={[
                          "translate(",
                          yLabelPosition.left ,
                          ",",
                          yLabelPosition.top,
                          ") rotate(-90)"
                        ].join("")}
                        textAnchor="middle"
                        fontSize={yLabelSize + "px"}
                    >
                      { yLabel === true ? yColumn : yLabel}
                    </text>
                  ) : null
                }
            </g>
        );
    }

    generateAxisTitleElement() {

        const {
            xLabel,
            yLabel
        } = this.getConfiguredProperties();

        const axis = this.getSVG().select('.axis-title');

        if(xLabel) {
            axis.select('.x-axis-label')
            .attr('text-anchor', 'middle');
        }

        if(yLabel) {
            axis.select('.x-axis-label')
              .attr('text-anchor', 'middle')
        }
    }

    setAxisTitles() {
        const {
            xColumn,
            xLabel,
            xLabelSize,
            yColumn,
            yLabel
        } = this.getConfiguredProperties();

        const tilePositions = this.getTitlePositions();

        const axis = this.getSVG().select('.axis-title');

        if(xLabel) {
            axis.select('.x-axis-label')
              .attr('x', tilePositions.x.left)
              .attr('y', tilePositions.x.top)
              .style('font-size', `${xLabelSize}px` )
              .text(xLabel === true ? xColumn : xLabel)
        }

        if(yLabel) {
            axis.select('.y-axis-label')
              .attr('font-size', `${xLabelSize}px` )
              .attr('transform', `translate(${tilePositions.y.left}, ${tilePositions.y.top}) rotate(-90)`)
              .text(yLabel === true ? yColumn : yLabel)
        }
    }
}

XYGraph.propTypes = {
  configuration: PropTypes.object,
  data: PropTypes.array
};
