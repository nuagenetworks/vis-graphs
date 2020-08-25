import PropTypes from 'prop-types';
import React from "react";

import AbstractGraph from "../AbstractGraph";

import "./style.css";

import { properties } from "./default.config";

import objectPath from "object-path";

/*
    This is a very basic graph that displays a text message
*/

const INITIAL_FONT_SIZE = 4

class TextGraph extends AbstractGraph {

    constructor(props) {
        super(props, properties);

        this.state = {
            fontSize: INITIAL_FONT_SIZE,
            height: props.height,
            width: props.width
        }
    }

    componentDidMount() {
        this.checkFontsize();
    }

    componentDidUpdate() {
        this.checkFontsize();
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.height !== nextProps.height || prevState.width !== nextProps.width) {
            return { 
                fontSize: INITIAL_FONT_SIZE,
                height: nextProps.height,
                width: nextProps.width
            };
        }
        return null;
    }

    checkFontsize() {
        const {
            height,
            width,
            data
        } = this.props;

        const {
            innerWidth,
            innerHeight,
            targetedColumn,
            defaultFontSize
        } = this.getConfiguredProperties();

        if (!data || !data.length)
            return;

        const text = this.displayText(data, targetedColumn) || 0

        const blockWidth = width * innerWidth
        const blockHeight = height * innerHeight
        const textSize = this.state.fontSize * text.toString().length * 0.4

        if (text.toString().length <= 3 && this.state.fontSize !== defaultFontSize) {
            this.setState({
                fontSize: defaultFontSize
            })
        }
        else if (blockWidth > textSize && blockHeight > textSize) {
            this.setState({
                fontSize: this.state.fontSize + 1
            })
        }
    }

    currentTitle() {
        const {
            configuration,
        } = this.props;

        if (configuration && configuration.title)
            return configuration.title;

        return "Untitled";
    }

    renderTitleIfNeeded(requestedPosition, currentPosition, title) {
        const { labelFontSize } = this.getConfiguredProperties();
        if (requestedPosition !== currentPosition)
            return;

        return (
            <div className="simpleText"
            style={{ fontSize: labelFontSize, marginBottom: 10, textAlign: 'center' }}>
                {(title !== undefined && title !== null) ? title : this.currentTitle()}
            </div>
        );
    }

    displayText(data, targetedColumn) {
        if (!data)
            return

        if (!targetedColumn)
            return data.length

        return objectPath.get(data[0], targetedColumn);
    }

    handleMarkerClick = e => {
        e.stopPropagation();
        const { data, onMarkClick } = this.props;
        if (data && Array.isArray(data) && data.length && onMarkClick) {
            onMarkClick(data[0])
        }
        return {};
    }

    renderText = ({
        blockWidth,
        blockHeight,
        borderRadius,
        stroke,
        fontColor,
        colors,
        cursor,
        data,
        padding,
        targetedColumn,
        titlePosition,
        customText
    }) => {
        return (
            <div style={{
                width: blockWidth,
                height: blockHeight,
                borderRadius: borderRadius,
                borderColor: stroke.color,
                borderWidth: stroke.width,
                background: colors[0],
                color: fontColor,
                fontSize: this.state.fontSize,
                cursor: cursor,
                margin: 'auto',
                display: 'table',
            }}
            >
                <div style={{
                    width: blockWidth,
                    height: blockHeight,
                    padding: [padding.top, padding.right, padding.bottom, padding.left].join(" "),
                    display: "table-cell",
                    verticalAlign: "middle",
                    textAlign: "center",
                    whiteSpace: 'nowrap',
                }}>
                    {this.displayText(data, targetedColumn)}
                    {this.renderTitleIfNeeded(titlePosition, "bottom", customText)}
                </div>
            </div>
        );
    }

    getStyleClasses = () => ('center-text simpleTextGraph')

    render() {
        const {
            height,
            onMarkClick,
            data,
            width,
        } = this.props;

        const {
            innerHeight,
            innerWidth,
            titlePosition,
        } = this.getConfiguredProperties();

        if (!data || !data.length)
            return this.renderMessage('No data to visualize')

        const cursor = onMarkClick ? "pointer" : undefined
        const blockWidth = width * innerWidth
        const blockHeight = height * innerHeight

        return (
            <div className={this.getStyleClasses()}
                onClick={this.handleMarkerClick}
            >
                {this.renderTitleIfNeeded(titlePosition, "top")}
                {
                    this.renderText({
                        ...this.getConfiguredProperties(),
                        blockWidth,
                        blockHeight,
                        cursor,
                        data
                    })
                }

            </div>
        );

    }
}

TextGraph.propTypes = {
    configuration: PropTypes.object
};

export default TextGraph
