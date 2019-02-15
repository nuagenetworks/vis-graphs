import PropTypes from 'prop-types';
import React from "react";

import "../style.css";

import SimpleTextGraph from "../SimpleTextGraph";

/*
    This graphs displays color coded statuses based on multi-column data
*/

class MultiColumnStatusTextGraph extends SimpleTextGraph {
    renderTitleIfNeeded() {
        return "";
    }

    getStyleClasses = () => {
        let { className } = this.getConfiguredProperties();
        if (!className) {
            className = "alarms-text";
        }
        return `${className} multiColumnStatusTextGraph`;
    }

    renderRow = ({data, column, text, color, fontColor, inline, key}) => (
        <div key={key} style={inline ? {padding: '10px'} : {display: "block", marginTop: '5%'}}>
            <div style={{width: "25%", display: "inline-block"}}>
                <div style={{
                    borderRadius: "100%",
                    height: "1.8em",
                    width: "1.8em",
                    textAlign: "center",
                    background: color,
                    display: "inline-block",
                    verticalAlign: "middle",
                    margin: "0 25px 0 0"
                }}
                >
                    <div style={{
                        marginTop: "0.32em",
                        fontSize: "1em",
                        color: fontColor,
                    }}>
                        <span>{this.displayText(data, column)}</span>
                    </div>
                </div>
            </div>

            <span style={{
                display: "inline-block",
                verticalAlign: "middle",
                textAlign: "left",
                width: "75%"}}>
                {text}
            </span>
        </div>
    )

    renderColumns = ({
                         fontColor,
                         padding,
                         colors,
                         cursor,
                         data,
                         titlePosition,
                         targetedColumns,
                         texts
                     }) => {
        const { inline } = this.getConfiguredProperties();
        return targetedColumns.map((targetedColumn, index) => (
            this.renderRow({data, inline, fontColor, text: texts[index], column: targetedColumn, color: colors[index], key: index})
        ))
    }

    renderText = ({targetedColumns, ...rest }) => {
        if (!targetedColumns || !targetedColumns.length) {
            return <div/>;
        }
        const { inline } = this.getConfiguredProperties();
        return (
            <div className={inline ? 'inline-alarms' : ''}>
                {this.renderColumns({targetedColumns, ...rest})}
            </div>
        )
    }
}

MultiColumnStatusTextGraph.propTypes = {
    configuration: PropTypes.shape({})
};

export default MultiColumnStatusTextGraph
