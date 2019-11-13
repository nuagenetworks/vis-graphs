import React from 'react';
import PropTypes from 'prop-types';
import objectPath from 'object-path';
import isEqual from 'lodash/isEqual'
import chunk from 'lodash/chunk'
import XYGraph from '../XYGraph';
import columnAccessor from '../../utils/columnAccessor';
import { properties } from './default.config';
import styles from './styles';
import evalExpression from 'eval-expression';
import { getIconPath, pick } from '../../utils/helpers';

const PROPS_FILTER_KEY = ['data', 'context', 'data2', 'height', 'width'];
class PortGraph extends XYGraph {

    constructor(props) {
        super(props, properties);

        this.isMultipleRows = false;
        this.state = {
            portAreaWidth: 100,
            rowCount: 0,
        }
    }

    componentDidMount() {
        this.initiate(this.props);
    }
    
    componentDidUpdate(prevProps) {
        if (!isEqual(pick(prevProps, ...PROPS_FILTER_KEY), pick(this.props, ...PROPS_FILTER_KEY))) {
            this.initiate(this.props);
        }
    }

    initiate(props) {
        this.checkMultipleRows(props);
        this.setPortAreaWidth(props);
        this.setRowCount(props);
    }


    // to check whether there are multiple rows or a single row
    checkMultipleRows(props) {
        const { data } = props;
        const { rowLimit } = this.getConfiguredProperties();

        this.isMultipleRows = data.length > rowLimit;
    }

    hasMultipleRows() {
        return this.isMultipleRows;
    }

    // calculate the width of each port section
    setPortAreaWidth(props) {
        const { data, width } = props;
        const { rowLimit, minPortWidth } = this.getConfiguredProperties();
        const portWidth = width / (this.hasMultipleRows() ? rowLimit : data.length);

        this.setState({ portAreaWidth: portWidth < minPortWidth ? minPortWidth : portWidth });
    }

    // calculate length of the row to show number of ports in each row. 
    setRowCount(props) {
        const { data } = props;
        const { rowLimit } = this.getConfiguredProperties();

        this.setState({ rowCount: this.hasMultipleRows() ? rowLimit : data.length });
    }

    // Get the color of the port icons based on the field's value set in configuration.
    getIconColor(row) {
        const {
            portColor,
            defaultIconColor
        } = this.getConfiguredProperties();

        const { getColor } = portColor || {};
        // if there is a getColor function then use that function otherwise use criteria
        if (getColor) {
            try {
                const getColorFunction = evalExpression(getColor);
                if (getColorFunction) {
                    return getColorFunction(row);
                }
            }
            catch (e) {
               console.error(`Failed to evaluate getColor function`, e);
            }
        }
        if (portColor && typeof portColor === 'object' && portColor.field) {
            let color = portColor.defaultColor || defaultIconColor;
            portColor.criteria.forEach(d => {
                if (d.value === objectPath.get(row, portColor.field)) {
                    color = d.color;
                }
            });

            return color;
        }

        return defaultIconColor;
    }

    // calculate the font size of port icon.
    calculatePortFontSize() {
        const { minPortFontSize, maxPortFontSize } = this.getConfiguredProperties();
        const font = this.state.portAreaWidth * 0.4;

        return font > maxPortFontSize ? maxPortFontSize : (font < minPortFontSize ? minPortFontSize : font);
    }

    // get port name
    getPortAttribute(row = {}, attribute) {
        return objectPath.get(row, attribute) || '';
    }

    // icon to show port status
    getIcon(row) {
        const { portIcon } = this.getConfiguredProperties();
        const fontSize = this.calculatePortFontSize();
        const { IconSvg, viewBox } = getIconPath(portIcon, row, true);

        return (
            <svg
                style={{ cursor: 'pointer' }}
                data-tip={true}
                data-for={this.tooltipId}
                onMouseMove={() => this.hoveredDatum = row}
                width={fontSize}
                height={fontSize}
                viewBox={viewBox}
            >
                <IconSvg color={this.getIconColor(row)}/>
            </svg>
        )
    }

    processPortRowset() {
        const { data } = this.props;
        const { rowLimit } = this.getConfiguredProperties();

        return chunk(data, rowLimit);
    }

    renderGraph() {
        const {
            topColumn,
            bottomColumn,
        } = this.getConfiguredProperties();
        const nextRow = this.hasMultipleRows();
        const portRowset = this.processPortRowset();
        const { rowCount } = this.state;

        return (
            <div style={{
                ...styles.iconContainer,
                justifyContent: nextRow ? 'flex-start' : 'space-between',
            }}>
                {
                    portRowset.map((portRow, index) => {
                        return (
                            <div
                                key={index}
                                style={styles.row}
                            >
                                {
                                    portRow.map((data, i) => {
                                        return (
                                            <div
                                                key={i}
                                                style={{
                                                    ...styles.portBox,
                                                    minWidth: this.state.portAreaWidth,
                                                }}
                                            >
                                                {this.getPortAttribute(data, topColumn)}
                                                <div style={{ borderRight: (i % rowCount) < (rowCount - 1) ? styles.borderRight : '' }}>
                                                    {this.getIcon(data)}
                                                </div>
                                                {this.getPortAttribute(data, bottomColumn)}
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        )
                    })}
            </div>
        );
    }

    getColumns = (columns, data) => (
        columns.map(column => {
                const accessor = columnAccessor(column);
                const columnsData = [];
                for (let d of data) {
                    const val = accessor(d);
                    if (val) {
                        columnsData.push(
                            <div style={{flexGrow: 1}}>
                                <strong>{column.label}:</strong> {val}
                            </div>
                        );
                    }
                }
                return columnsData;
            }
        )
    )

    // show "key: value" data in top section of the graph
    renderColumns() {
        const { data2 } = this.props;
        const { columns, rows } = this.getConfiguredProperties();

        let columnData = [];
        if (Array.isArray(rows) && rows.length && data2.length) {
            columnData = rows.map( rowItem => this.getColumns(rowItem, data2))
        }
        else if (Array.isArray(columns) && columns.length && data2.length) {
            columnData.push(this.getColumns(columns, data2));

        }

        return (
            columnData.map((rowData, idx) => (<div style={styles.labelContainer}><div style={{...styles.labelRow, order: idx + 1}}>{rowData}</div></div>))
        )
    }

    render() {
        const {
            data,
            width,
            height,
        } = this.props;

        if (!data.length) {
            return this.renderMessage('No data to visualize');
        }

        return (
            <div className='port-graph'>
                <div>{this.tooltip}</div>
                <div style={{ width, height, ...styles.container }}>
                    {this.renderColumns()}
                    {this.renderGraph()}
                </div>
            </div>
        )
    }
}


PortGraph.defaultProps = {
    data: [],
    data2: []
};

PortGraph.propTypes = {
    data: PropTypes.array,
    height: PropTypes.number,
    width: PropTypes.number,
};

export default PortGraph;
