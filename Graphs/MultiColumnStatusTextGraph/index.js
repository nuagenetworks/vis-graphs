import PropTypes from 'prop-types';
import React from "react";
import { styled } from '@material-ui/core/styles';
 
import "../style.css";
import SimpleTextGraph from "../SimpleTextGraph";

const Container = styled('div')({
    marginBottom: '5px',
});

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
        <div key={key} style={inline ? {} : {display: "block", marginTop: '2%'}}>
            <div style={{width: "25%", display: "inline-block"}}>
                <div style={{
                    borderRadius: "100%",
                    height: "2.7em",
                    width: "2.7em",
                    textAlign: "center",
                    background: color,
                    display: "inline-block",
                    verticalAlign: "middle",
                    margin: "0 25px 0 0"
                }}
                >
                    <div style={{
                        position: 'relative',
                        top: "35%",
                        fontSize: ".7em",
                        color: fontColor,
                    }}>
                        <span>{this.displayText(data, column)}</span>
                    </div>
                </div>
            </div>

            <span style={{
                display: "inline-block",
                verticalAlign: "right",
                textAlign: "center",
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
            <Container className={inline ? 'inline-alarms' : ''} >
                {this.renderColumns({targetedColumns, ...rest})}
            </Container>
        )
    }
}

MultiColumnStatusTextGraph.propTypes = {
    configuration: PropTypes.shape({})
};

export default MultiColumnStatusTextGraph
