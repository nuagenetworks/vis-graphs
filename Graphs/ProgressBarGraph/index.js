import React from "react";
import * as d3 from 'd3';

import { properties } from './default.config';
import AbstractGraph from "../AbstractGraph";
import style from './style';

const PERCENTAGE = 'percentage';

export default class ProgressBarGraph extends AbstractGraph {

    constructor(props) {
        super(props, properties);
    }

    getWidth = (barData, width) => {
        const {
            maxData,
            usedData,
        } = this.getConfiguredProperties();

        return barData[maxData] ? width * barData[usedData] / barData[maxData] : width * barData[usedData] * 0.01;
    }

    getData = (barData) => {
        const {
            maxData,
            usedData,
            display,
            maxDataFormat,
            defaultRange,
        } = this.getConfiguredProperties();

        if (display === PERCENTAGE) {
            const data = barData[maxData] ? parseInt(barData[usedData] * 100 / barData[maxData]) : barData[usedData];
            return `${data}%`;
        }

        barData[usedData] = d3.format(maxDataFormat)(barData[usedData]);
        barData[maxData] = barData[maxData] ? d3.format(maxDataFormat)(barData[maxData]) : undefined;

        return barData[maxData] ? `${barData[usedData]} / ${barData[maxData]}` : `${barData[usedData]} / ${defaultRange}`;
    }

    getPercentage = (barData, width) => {
        const {
            maxData,
            usedData,
        } = this.getConfiguredProperties();

        return barData[maxData] ? (width * barData[usedData] / barData[maxData]) * 100 / width : barData[usedData];
    }

    getColor = (barData, width) => {
        const {
            barColor,
            colorRange,
        } = this.getConfiguredProperties();

        let setColor = false;

        if (colorRange) {
            const percentage = this.getPercentage(barData, width);
            let colorData;
            colorRange.filter((d) => {
                if (percentage <= d['upto'] && !setColor) {
                    setColor = true;
                    colorData = d;
                }
            });

            return colorData['color'];
        }

        return barColor;
    }

    render() {
        const {
            data,
            width,
            height,
        } = this.props;

        const {
            margin,
            label,
            display,
            chartWidthToPixel,
            minSectionHeight,
            backgroundColor,
        } = this.getConfiguredProperties();

        if (!data.length) {
            return;
        }

        const availableWidth = width - (margin.left + margin.right);
        let barWidth = availableWidth;
        if (display === PERCENTAGE) {
            const labelWidth = this.longestLabelLength(data, (d) => this.getData(d)) * chartWidthToPixel;
            barWidth = availableWidth - labelWidth;
        }

        let sectionHeight = height / (data.length + 1);
        const barHeight = (display === PERCENTAGE) ? (sectionHeight * 0.60) : sectionHeight * 0.50;

        if (sectionHeight < minSectionHeight) {
            sectionHeight = minSectionHeight;
        }

        return (
            <div
                className="progress-graph"
                style={{
                    width: availableWidth,
                    height,
                    marginLeft: margin.left,
                    marginRight: margin.right,
                    ...style.container
                }}
            >
                {
                    data.map((d, i) => {
                        return (
                            <div
                                key={i}
                                style={{
                                    height: sectionHeight,
                                    width: availableWidth,
                                    ...style.section
                                }}
                            >
                                <div style={style.upperText}> {d[label]} </div>
                                <div style={{
                                    ...style.barSection,
                                    flexDirection: (display === PERCENTAGE) ? 'row' : 'column',
                                }}>
                                    <div style={{
                                        height: barHeight,
                                        ...style.innerBarSection
                                    }}>
                                        <svg style={{ width: barWidth, height: barHeight }}>
                                            <g>
                                                <rect
                                                    width={barWidth}
                                                    height={barHeight}
                                                    fill={backgroundColor}
                                                />
                                                <rect
                                                    width={this.getWidth(d, barWidth)}
                                                    height={barHeight}
                                                    fill={this.getColor(d, barWidth)}
                                                />
                                            </g>
                                        </svg>
                                    </div>
                                    <div style={{
                                        ...style.lowerText,
                                        alignSelf: (display === PERCENTAGE) ? 'center' : 'flex-end',
                                    }}>
                                        &nbsp;{this.getData(d)}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        );
    }
}

ProgressBarGraph.propTypes = {
    configuration: React.PropTypes.object,
    data: React.PropTypes.arrayOf(React.PropTypes.object),
};

ProgressBarGraph.defaultProps = {
    width: 100,
    height: 100,
    data: [],
    configuration: {}
};

