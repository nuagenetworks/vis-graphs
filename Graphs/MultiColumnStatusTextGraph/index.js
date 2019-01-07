import PropTypes from 'prop-types';
import React from "react";

import "../style.css";

import SimpleTextGraph from "../SimpleTextGraph";

/*
    This graphs displays color coded statuses based on multi-column data
*/

class MultiColumnStatusTextGraph extends SimpleTextGraph {

    renderText = ({
                  blockWidth,
                  blockHeight,
                  borderRadius,
                  stroke,
                  fontColor,
                  padding,
                  colors,
                  cursor,
                  data,
                  titlePosition,
                  targetedColumns,
                  texts
    }) => {
        if (!targetedColumns || !targetedColumns.length) {
            return <div/>;
        }
        const columns = targetedColumns.map((targetedColumn, index) => {
            return (
                <div style={{display: "block", marginTop: '3px'}}>
                    <div style={{width: "25%", display: "inline-block"}}>
                        <div style={{
                            borderRadius: "100%",
                            height: "1.8em",
                            width: "1.8em",
                            textAlign: "center",
                            background: colors[index],
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
                                <span>{this.displayText(data, targetedColumn)}</span>
                            </div>
                        </div>
                    </div>

                    <span style={{
                        display: "inline-block",
                        verticalAlign: "middle",
                        textAlign: "left",
                        fontSize: ".65em",
                        width: "75%"
                    }}>{texts[index]}</span>
                </div>
            )
        })
        return (
            <div>
                {columns}
            </div>
        )
    }
}

MultiColumnStatusTextGraph.propTypes = {
    configuration: PropTypes.shape({})
};

export default MultiColumnStatusTextGraph