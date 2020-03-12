import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import evalExpression from 'eval-expression';
import objectPath from 'object-path';
import chunk from 'lodash/chunk';
import { styled } from '@material-ui/core/styles';

import columnAccessor from '../../utils/columnAccessor';
import WithConfigHOC from '../../HOC/WithConfigHOC';
import WithValidationHOC from '../../HOC/WithValidationHOC';
import { config } from './default.config';
import { getIconPath } from '../../utils/helpers';
import InfoBox from "../../InfoBox";
import { customTooltip, renderLegend, getGraphDimension, checkIsVerticalLegend } from '../utils/helper';

const MAX_LABEL_LENGTH = 8;

const getColumns = (columns, data) => (
    columns.map(column => {
        const accessor = columnAccessor(column);
        const columnsData = [];
        for (let d of data) {
            const val = accessor(d);
            if (val) {
                columnsData.push(
                    <div style={{ flexGrow: 1 }}>
                        <strong>{column.label}:</strong> {val}
                    </div>
                );
            }
        }
        return columnsData;
    })
);

// get port name
const getPortAttribute = (row = {}, attribute) => {
    const label = objectPath.get(row, attribute);

    return label ? ((label.length > MAX_LABEL_LENGTH) ?
        label.substr(0, MAX_LABEL_LENGTH) + '...' : label) : '';
}

const Container = styled('div')({
    width: ({ width } = {}) => width,
    height: ({ height } = {}) => height,
    display: ({ display } = {}) => display
});

const GraphContainer = styled('div')({
    width: ({ width } = {}) => width,
    height: ({ height } = {}) => height,
    display: 'flex',
    verticalAlign: 'middle',
    flexFlow: 'row wrap',
    overflowY: 'auto',
    order: ({ isVertical } = {}) => isVertical ? 2 : 1
});

const IconContainer = styled('div')({
    display: 'contents',
    justifyContent: ({ justifyContent } = {}) => justifyContent,
});

const LabelContainer = styled('div')({
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    fontSize: ({ fontSize } = {}) => fontSize,
});

const LabelItem = styled('div')({
    width: '100%',
    display: 'flex',
    overflow: 'hidden',
    listStyle: 'none',
    padding: '0.6em 1em',
    order: ({ order } = {}) => order,
});

const Item = styled('div')({
    display: 'flex',
    flexFlow: 'row nowrap',
    marginLeft: '0.6rem',
    marginTop: '0.5rem',
});

const PortBox = styled('div')({
    textAlign: 'center',
    marginBottom: '0.6rem',
    minWidth: ({ minWidth }) => minWidth,
});

const Icon = styled('div')({
    marginBottom: '0.5rem',
    marginTop: '0.5rem',
});

const UpperText = styled('div')({
    marginRight: '0.5rem',
    fontSize: ({ fontSize } = {}) => fontSize,
});

const LowerText = styled('div')({
    marginRight: '0.5rem',
    fontSize: ({ fontSize } = {}) => fontSize,
})

const Svg = styled('svg')({
    cursor: 'pointer', 
    background: ({ background } = {}) => background, 
    padding: '0.4rem',
});

const Tooltip = styled('div')({});

const PortGraph = (props) => {
    let isMultipleRows = false;

    const [portAreaWidth, setStatePortAreaWidth] = useState(100);
    const [rowCount, setStateRowCount] = useState(0);
    const [openModal, setOpenModal] = useState(false);
    const [infoBoxData, setInfoBoxData] = useState({});
    const [customTooltips, setCustomTooltips] = useState({});
    const [hoveredDatum, setHoveredDatum] = useState(null);

    useEffect(() => {
        initiate(props);
        setCustomTooltips(customTooltip(properties));
    }, [props.data, props.height, props.width, props.data2])

    const {
        data,
        data2,
        width,
        height,
        properties
    } = props;

    const {
        topColumn,
        bottomColumn,
        rowLimit,
        columns,
        rows,
        tooltipScript,
        portIcon,
        defaultIconColor,
        portColor,
        legend,
        legendArea,
        circleToPixel,
        fontColor,
        id,
        showUpperColumnName,
        showLowerColumnName,
        minPortFontSize,
        maxPortFontSize,
        fontSize,
        background,
    } = properties;

    const getIconColor = (row) => {

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

    const checkMultipleRows = ({ data, rowLimit }) => {
        isMultipleRows = data.length > rowLimit;
    }

    const setPortAreaWidth = ({ data, width, rowLimit, minPortWidth }) => {
        const portWidth = (width * 0.95) / (isMultipleRows ? rowLimit : data.length);

        setStatePortAreaWidth(portWidth < minPortWidth ? minPortWidth : portWidth);
    }

    // calculate length of the row to show number of ports in each row.
    const setRowCount = ({ data, rowLimit }) => {
        setStateRowCount(isMultipleRows ? rowLimit : data.length);
    }

    const renderInfoBox = () => {
        if (!tooltipScript) {
            return;
        }
        const Scripts = require('@/scripts');
        const TooltipComponent = Scripts[tooltipScript];
        return (
            openModal &&
            <InfoBox
                onInfoBoxClose={onInfoBoxCloseHandler}
            >
                <TooltipComponent
                    data={infoBoxData}
                    data2={data2}
                    {...properties} />
            </InfoBox>
        )
    }

    const onInfoBoxCloseHandler = () => {
        setOpenModal(false);
    }

    const openInfoBox = (data) => ev => {
        ev.stopPropagation();
        setInfoBoxData(data);
        setOpenModal(true);
    }

    const portRowset = chunk(data, rowLimit);

    const getTooltipContent = ({ tooltipScript, tooltip, yTicksLabel, data2 }) => {
        if (hoveredDatum) {
            if (tooltipScript) {
                const Scripts = require('@/scripts');
                const TooltipComponent = Scripts[tooltipScript];
                return (
                    <TooltipComponent
                        data={hoveredDatum}
                        data2={data2}
                        {...properties} />
                )
            }

            const accessors = tooltip.map(columnAccessor);
            return tooltipContent({ tooltip, accessors, yTicksLabel })
        } else {
            return <div>Hover over a port icon to see details.</div>;
        }
    }

    const initiate = (props) => {
        const {
            data,
            data2,
            width,
            properties,
        } = props;

        const {
            tooltipScript,
            tooltip,
            rowLimit,
            minPortWidth,
            yTicksLabel,
        } = properties;

        checkMultipleRows({ data, rowLimit });
        setPortAreaWidth({ data, width, rowLimit, minPortWidth });
        setRowCount({ data, rowLimit });
        getTooltipContent({ tooltipScript, tooltip, yTicksLabel, data2 });
    }

    const tooltipContent = ({ tooltip, accessors, yTicksLabel }) => {
        if (!yTicksLabel || typeof yTicksLabel !== 'object') {
            yTicksLabel = {};
        }

        if (!Array.isArray(tooltip)) {
            return null;
        }

        return (
            /* Display each tooltip column as "label : value". */
            tooltip.map(({ column, label }, i) => {
                let data = accessors[i](hoveredDatum)

                return (data !== null && data !== 'undefined') ?
                    (<div key={column}>
                        <strong>
                            {/* Use label if present, fall back to column name. */}
                            {label || column}
                        </strong> : <span>
                            {/* Apply number and date formatting to the value. */}
                            {yTicksLabel[data] || data}
                        </span>
                    </div>
                    ) : null
            })

        )
    }

    const renderColumns = () => {

        let columnData = [];
        if (Array.isArray(rows) && rows.length && data2.length) {
            columnData = rows.map(rowItem => getColumns(rowItem, data2))
        }
        else if (Array.isArray(columns) && columns.length && data2.length) {
            columnData.push(getColumns(columns, data2));
        }

        return (
            columnData.map((rowData, idx) => (
                <LabelContainer fontSize={fontSize}>
                    <LabelItem order={idx + 1}
                    >
                        {rowData}
                    </LabelItem>
                </LabelContainer>
            ))
        )
    }

    // calculate the font size of port icon.
    const calculatePortFontSize = () => {
        const font = portAreaWidth * 0.4;

        return font > maxPortFontSize ? maxPortFontSize : (font < minPortFontSize ? minPortFontSize : font);
    }

    // icon to show port status
    const getIcon = (data) => {
        const calculatedFontSize = calculatePortFontSize();
        const { IconSvg, viewBox } = getIconPath(portIcon, data, true);
        return (
            <Svg
                background={background}
                data-tip={true}
                data-for={id}
                onMouseMove={() => setHoveredDatum(data)}
                width={calculatedFontSize}
                height={calculatedFontSize}
                viewBox={viewBox}
            >
                <IconSvg color={getIconColor(data)} />
            </Svg>
        )
    }

    const renderPort = () => {
        return (
            portRowset.map((portRow, index) => {
                return (
                    <Item key={index}>
                        {portRow.map((data, i) => {
                            return (
                                <PortBox
                                    key={i}
                                    minWidth={portAreaWidth}
                                    onClick={openInfoBox(data)}
                                >
                                    {showUpperColumnName && topColumn && <UpperText fontSize={fontSize}>{getPortAttribute(data, topColumn)}</UpperText>}
                                    {showUpperColumnName && !topColumn && <UpperText fontSize={fontSize}>{`Port ${index ? ((index * rowLimit) + i + 1) : i + 1}`}</UpperText>}
                                    <Icon>{getIcon(data)}</Icon>
                                    {showLowerColumnName && bottomColumn && <LowerText fontSize={fontSize}>{getPortAttribute(data, bottomColumn)}</LowerText>}
                                </PortBox>
                            )
                        })
                        }
                    </Item>
                )
            })
        )
    }

    const legendData = legend && legend.getData ? evalExpression(legend.getData)(data) : data;
    const legendGetColor = legend && legend.getColor ? evalExpression(legend.getColor) : getIconColor;
    const legendGetLabel = legend && legend.getLabel ? evalExpression(legend.getLabel) : (d) => (d);
    const isVertical = false;

    const {
        graphHeight,
        graphWidth,
    } = getGraphDimension(
        {
            height,
            width,
            data,
            legendArea,
            legend
        },
        legendGetLabel,
        legendData
    );

    return (
        <Container
            height={height}
            width={width}
            display={isVertical ? 'flex' : 'inline-grid'}
        >
            <Tooltip> {customTooltips.tooltipWrapper && customTooltips.tooltipWrapper(hoveredDatum)} </Tooltip>
            {
                renderLegend(
                    {
                        width,
                        height,
                        legendArea,
                        fontColor,
                        circleToPixel
                    },
                    legendData,
                    legend,
                    legendGetColor,
                    legendGetLabel,
                    isVertical
                )
            }
            <GraphContainer
                width={graphWidth}
                height={graphHeight}
                data-test="port-graph"
                isVertical={isVertical}
            >
                {renderColumns()}
                <IconContainer
                    justifyContent={isMultipleRows ? 'flex-start' : 'space-between'}
                >
                    {renderInfoBox()}
                    {renderPort()}
                </IconContainer>
            </GraphContainer>
        </Container>
    );
}

PortGraph.defaultProps = {
    data: [],
    data2: []
};

PortGraph.propTypes = {
    configuration: PropTypes.object,
    data: PropTypes.array,
};

export default compose(
    WithValidationHOC(),
    (WithConfigHOC(config))
)(PortGraph) 
