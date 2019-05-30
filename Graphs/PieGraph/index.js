import PropTypes from 'prop-types';
import React from "react";

import AbstractGraph from "../AbstractGraph";

import * as d3 from "d3";

import "./style.css";

import {properties} from "./default.config"
import { filterEmptyData, limit } from "../../utils/helpers"


export default class PieGraph extends AbstractGraph {

    constructor(props) {
        super(props, properties);
    }

    getColor = (scale) => {
        const {
            stroke,
            colorColumn,
            labelColumn,
            colors,
            legendColumn,
            emptyBoxColor
        } = this.getConfiguredProperties()


        return (d) => {
            let value = null
            if (d.hasOwnProperty(legendColumn)) {
                value = d[legendColumn]
            } else if (d.hasOwnProperty(colorColumn)) {
                value = d[colorColumn]
            } else if (d.hasOwnProperty(labelColumn)) {
                value = d[labelColumn]
            } else if (d.hasOwnProperty("key")) {
                value = d["key"]
            }

            if (value === 'Empty') {
                return emptyBoxColor
            }
            return scale ? scale(value) : stroke.color || colors[0];
        }

    }

    render() {
        const {
            data: originalData,
            height,
            width,
            onMarkClick
        } = this.props;

        const {
            graphHeight,
            graphWidth,
        } = this.getGraphDimension(label);

        if (!originalData || !originalData.length)
            return this.renderMessage("No data to visualize");

        const {
            colorColumn,
            sliceColumn,
            labelColumn,
            legend,
            margin,
            pieInnerRadius,
            pieOuterRadius,
            pieLabelRadius,
            stroke,
            fontColor,
            percentages,
            percentagesFormat,
            otherOptions,
            showZero,
            mappedColors,
            labelCount,
            labelLimit,
            labelFontSize,
        } = this.getConfiguredProperties();


        /*
        Add below code snippet in visulaization's configuration json files
        to use grouping data feature

        "others": {
            "label": "Others",
            "limit": 5
        }

        */
        const settings = {
            "metric": sliceColumn,
            "dimension": labelColumn,
            "limitOption": otherOptions
          };

        const data =  limit({
            data: filterEmptyData({
                data: originalData,
                column: sliceColumn,
                showZero:showZero
            }),
            ...settings
        })

        if (!data || !data.length)
            return this.renderMessage("No data to visualize")

        let availableWidth     = graphWidth - (margin.left + margin.right);
        let availableHeight    = graphHeight - (margin.top + margin.bottom);
        const value            = (d) => d[sliceColumn];
        const label            = (d) => d[labelColumn];
        const scale            = mappedColors ?
            this.getMappedScaleColor(data, labelColumn) : this.scaleColor(data, labelColumn);

        const getColor         = mappedColors ?
            this.getColor(scale) : (d) => scale ? scale(d[colorColumn || labelColumn]) : null;

        const maxRadius   = Math.min(availableWidth, availableHeight) / 2;
        const innerRadius = pieInnerRadius * maxRadius;
        const outerRadius = pieOuterRadius * maxRadius;
        const labelRadius = pieLabelRadius * maxRadius;

        const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        const labelArc = d3.arc()
            .innerRadius(labelRadius)
            .outerRadius(labelRadius);

        const pie    = d3.pie().value(value).sort(null);
        const slices = pie(data);

        const getLabelText = (() => {
            if (percentages) {
                const percentageFormat = d3.format(percentagesFormat || ",.2%");
                const sum              = d3.sum(data, value);
                return (d) => percentageFormat(value(d) / sum);
            }
            return label;
        })();

        const style = {
            strokeStyle: {
                strokeWidth: stroke.width,
                stroke: stroke.color
            },
            graphStyle: {
                width: graphWidth,
                height: graphHeight,
                order:this.checkIsVerticalLegend() ? 2 : 1,
            }
        };

        return (
            <div className="pie-graph">
                {this.tooltip}
                <div style={{ height, width,  display: this.checkIsVerticalLegend() ? 'flex' : 'inline-grid'}}>
                    {this.renderLegend(data, legend, getColor, label,this.checkIsVerticalLegend())}
                    <div className='graphContainer' style={ style.graphStyle }>
                        <svg width={ graphWidth } height={ graphHeight }>
                            <g className = {'pieGraph'} transform={ `translate(${ graphWidth / 2 }, ${ graphHeight / 2 })` } >
                                {
                                    slices.map((slice, i) => {
                                        const d = slice.data;
                                        const labelFullText = labelCount >= slices.length ? getLabelText(d) : '';
                                        const isTruncate = labelFullText.length > labelLimit;
                                        const labelText = isTruncate ? `${labelFullText.substr(0, labelLimit)}...` : labelFullText;

                                        // Set up clicking and cursor style.
                                        const { onClick, cursor } = (
                                            onMarkClick && (!otherOptions || d[settings.dimension] !== otherOptions.label) ? {
                                                onClick: () => onMarkClick(d),
                                                cursor: "pointer"
                                            } : { }
                                        );

                                        const textAnchor = (
                                        (pieLabelRadius > pieOuterRadius)
                                        ? ((slice.startAngle + slice.endAngle) / 2 < Math.PI ? "start" : "end")
                                        : "middle"
                                        );

                                        return <g className="section" key={i} >
                                            <path
                                            d={ arc(slice) }
                                            fill={ getColor(d) }
                                            onClick={ onClick }
                                            style={ Object.assign({cursor}, style.strokeStyle) }
                                            { ...this.tooltipProps(d) }
                                            />
                                            <text
                                            transform={`translate(${labelArc.centroid(slice)})`}
                                            textAnchor={ textAnchor }
                                            dy=".35em"
                                            fill={ fontColor }
                                            onClick={ onClick }
                                            style={{cursor, fontSize: labelFontSize}}
                                            { ...this.tooltipProps(d) }
                                            >
                                                <title>{isTruncate ? labelFullText : ''}</title>
                                                { labelText }
                                            </text>
                                        </g>
                                    })
                                }
                            </g>
                           
                        </svg>
                    </div>
                </div>
            </div>
        );
    }
}

PieGraph.propTypes = {
  configuration: PropTypes.object,
  data: PropTypes.array
};
