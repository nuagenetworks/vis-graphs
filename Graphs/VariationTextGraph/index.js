import PropTypes from 'prop-types';
import React from "react";

import AbstractGraph from "../AbstractGraph";

import AngleDown  from 'react-icons/lib/fa/angle-down';
import AngleUp  from 'react-icons/lib/fa/angle-up';

import style from "./styles"
import {properties} from "./default.config"
import { format, timeFormat } from "d3";
const d3 = { format, timeFormat };

/*
    This graph will present the variation between 2 values:
     - Last value
     - Variation between previous value and last value
*/
export class VariationTextGraph extends AbstractGraph {

    constructor(props) {
        super(props, properties);
        this.settings = {
            colors: null,
            icon: 'down',
            values: null
        }
    }

    componentWillMount() {
        this.initialize()
    }

    initialize() {
        const {
            data,
        } = this.props;

        const {
            target,
            positiveColors,
            negativeColors,
            drawColors
        } = this.getConfiguredProperties();

        this.settings.values = this.computeValues(data, target);

        if (!this.settings.values)
            return;

        this.settings.colors = drawColors;

        if (this.settings.values.variation > 0){
            this.settings.colors = positiveColors;
            this.settings.icon = 'up';
        }

        if (this.settings.values.variation < 0){
            this.settings.colors = negativeColors;
            this.settings.icon = 'down';
        }

        /**
         *CODE IS TO CHANGE THE HEADER colors
         */
        //this.props.setHeaderColor(configuration.id, this.settings.colors.header);
    }

    currentTitle() {
        const {
            configuration,
        } = this.props;

        if (configuration && configuration.title)
            return configuration.title;

        return "Untitled";
    }

    renderTitleIfNeeded(requestedPosition, currentPosition) {
        if (requestedPosition !== currentPosition)
            return;

        return this.currentTitle();
    }

    computeValues(data, target) {
        if (!data || !target)
            return;

        let lastInfo,
            previousInfo;

        data.forEach((d) => {
            if (d[target.column] === target.value)
                lastInfo = d;
            else
                previousInfo = d;
        })

        const variation = lastInfo[target.field] - previousInfo[target.field];

        return {
            lastValue: lastInfo[target.field],
            previousValue: previousInfo[target.field],
            variation: variation !== 0 ? variation * 100 / previousInfo[target.field] : 0
        }
    }

    numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    formattedValue(x, format) {
        let formatter = d3.format(format);
        return formatter(x);
    }

    decimals(x, nb = 2) {
        return x.toFixed(nb)
    }

    getFormattedValue(x) {
        const {
            target
        } = this.getConfiguredProperties();
        return (target.format) ? this.formattedValue(x, target.format) : this.numberWithCommas(x);
    }

    renderIcon(icon) {
        return icon === 'up' ? <AngleUp size={20} /> : <AngleDown size={20} />;
    }

    renderValues() {
        if(!this.settings.values)
            return;

        const {
            absolute,
        } = this.getConfiguredProperties();

        const {
            context
        } = this.props;

        let info = null;


        if (!absolute) {
            info =
                <span style={{ color: this.settings.colors.content, margin:"auto" }}>
                    { this.getFormattedValue(this.settings.values.lastValue) }
                 </span>
        } else {
          info =
            <span style={{ color : this.settings.colors.content, margin:"auto"}}>
                {this.getFormattedValue(this.settings.values.lastValue)} / {this.getFormattedValue(this.settings.values.previousValue)}
            </span>
        }

        let fullScreenFont = context && context.hasOwnProperty("fullScreen") ? style.fullScreenLargeFont : {};
        return (

            <div style={{height: "100%"}}>
                <span style={Object.assign({}, style.infoBoxIcon, this.settings.colors.iconBox ? {backgroundColor: this.settings.colors.iconBox} : {})}>
                    <div style={Object.assign({}, style.iconFont, (context && context.hasOwnProperty("fullScreen")) ? style.fullScreenLargerFont : {})}>
                        <div style={Object.assign({}, style.labelText, fullScreenFont)}>
                            { this.renderIcon(this.settings.icon) } <br/>
                            {`${this.decimals(this.settings.values.variation)}%`}
                        </div>
                    </div>
                </span>
                <span style={Object.assign({}, style.infoBoxText, fullScreenFont)}>
                    {info}
                </span>
            </div>
        )
    }

    render() {
        const {
            onMarkClick,
            data
        } = this.props;

        const {
          textAlign,
        } = this.getConfiguredProperties();

        if (!data || !data.length)
            return;

        const cursor = onMarkClick ? "pointer" : undefined
        return (

                <div
                    style={{
                        textAlign: textAlign,
                        cursor: cursor,
                        fontSize: "1.2em",
                        height: "100%"
                    }}
                    onClick={onMarkClick}
                    >
                    {this.renderValues()}
                </div>
        );

    }
}

VariationTextGraph.propTypes = {
  configuration: PropTypes.object,
  data: PropTypes.array
};

export default VariationTextGraph;
