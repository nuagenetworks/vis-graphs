import React, { useEffect, useState } from "react";
import { format } from "d3";
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { styled } from '@material-ui/core/styles';

import WithConfigHOC from '../../HOC/WithConfigHOC';
import WithValidationHOC from '../../HOC/WithValidationHOC';
import { config } from './default.config';
import { PERCENTAGE } from '../../constants';
import { longestLabelLength, customTooltip } from '../utils/helper';

const getWidth = (
    barData,
    width,
    maxData,
    usedData
) => {
    return barData[maxData] ? width * barData[usedData] / barData[maxData] :
        width * barData[usedData] * 0.01;
}

const getData = ({
    barData,
    maxData,
    usedData,
    display,
    maxDataFormat,
    defaultRange,
    units
}) => {

    if (display === PERCENTAGE) {
        const data = barData[maxData] ? parseInt(barData[usedData] * 100 / barData[maxData]) : barData[usedData];
        return `${data}%`;
    }

    barData[usedData] = format(maxDataFormat)(barData[usedData]);
    barData[maxData] = barData[maxData] ? format(maxDataFormat)(barData[maxData]) : undefined;
    const dataUnits = barData['unit'] || units ? ` ${barData['unit'] || units}` : '';

    return barData[maxData] ? `${parseInt(barData[usedData])}${dataUnits}/ ${parseInt(barData[maxData])}${dataUnits}` : `${parseInt(barData[usedData])}${dataUnits}/ ${parseInt(defaultRange)}${dataUnits}`;
}

const getPercentage = ({
    barData,
    width,
    maxData,
    usedData
}) => {
    return barData[maxData] ? (width * barData[usedData] / barData[maxData]) * 100 / width : barData[usedData];
}

const getColor = ({
    barData,
    width,
    barColor,
    colorRange,
    maxData,
    usedData
}) => {

    let setColor = false;

    if (colorRange) {
        const percentage = getPercentage(barData, width, maxData, usedData);
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

const getDimensions = ({
    data,
    width,
    margin,
    maxData,
    usedData,
    display,
    maxDataFormat,
    defaultRange,
    units,
    height,
    maxSectionHeight,
    minSectionHeight,
    chartWidthToPixel
}) => {
    const availableWidth = width - (margin.left + margin.right);
    let barWidth = availableWidth;
    if (display === PERCENTAGE) {
        const labelWidth = longestLabelLength(data,
            (barData) => getData({ barData, maxData, usedData, display, maxDataFormat, defaultRange, units }))
            * chartWidthToPixel;
        barWidth = availableWidth - labelWidth * 1.30;
    }

    let sectionHeight = height / (data.length + 1);

    if (sectionHeight > maxSectionHeight) {
        sectionHeight = maxSectionHeight;
    }

    const barHeight = (display === PERCENTAGE) ? (sectionHeight * 0.50) : sectionHeight * 0.45;

    let textWidth;
    if (sectionHeight < minSectionHeight) {
        sectionHeight = minSectionHeight;
        if (display !== PERCENTAGE) {
            textWidth = longestLabelLength(data);
            barWidth = availableWidth - textWidth;
        }
    }

    return {
        barHeight,
        barWidth,
        availableWidth,
        sectionHeight,
        textWidth,
    }
}

const Container = styled('div')({
    fontSize: ({ fontSize } = {}) => fontSize,
    width: ({ width } = {}) => width,
    height: ({ height } = {}) => height,
    padding: '0.6rem',
    overflowY: 'auto',
    overflowX: 'hidden',
    position: 'relative',
});

const Item = styled('div')({
    width: ({ width } = {}) => width,
    height: ({ height } = {}) => height,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
});

const UpperText = styled('div')({
    fontSize: ({ fontSize } = {}) => fontSize,
    order: 1,
    marginBottom: '0.2rem'
});

const BarSection = styled('div')({
    order: 2,
    display: 'flex',
    flexDirection: ({ direction } = {}) => direction,
});

const InnerBarSection = styled('div')({
    order: 1,
    flex: 1,
    height: ({ height } = {}) => height,
});

const LowerText = styled('div')({
    fontSize: ({ fontSize } = {}) => fontSize,
    order: 2,
    flex: 'auto',
    alignSelf: ({ alignSelf } = {}) => alignSelf,
    marginRight: ({ marginRight } = {}) => marginRight,
    marginTop: '0.4rem'
});

const Tooltip = styled('div')({});

let dimension = {};

const ProgressBarGraph = (props) => {
    const [customTooltips, setCustomTooltips] = useState({});
    const [hoveredDatum, setHoveredDataum] = useState(null);

    const {
        data,
        width,
        height,
        properties
    } = props;

    const {
        margin,
        label,
        display,
        chartWidthToPixel,
        minSectionHeight,
        backgroundColor,
        maxData,
        usedData,
        barColor,
        colorRange,
        units,
        maxDataFormat,
        defaultRange,
        fontSize,
        maxSectionHeight,
        id
    } = properties;

    useEffect(() => {
        setCustomTooltips(customTooltip(properties));
        dimension = getDimensions(
            {
                data,
                width,
                margin,
                maxData,
                usedData,
                display,
                maxDataFormat,
                defaultRange,
                units,
                height,
                maxSectionHeight,
                minSectionHeight,
                chartWidthToPixel
            }
        );
    }, [props.data, props.width, props.height]);

    const setHoveredData = (barData) => {
        if (barData) {
            setHoveredDataum(barData);
        }
    }

    const {
        barHeight,
        barWidth,
        availableWidth,
        sectionHeight,
        textWidth,
    } = dimension;

    return (
        <React.Fragment>
            <Tooltip>{customTooltips.tooltipWrapper && customTooltips.tooltipWrapper(hoveredDatum)}</Tooltip>

            <Container
                fontSize={fontSize}
                width={availableWidth}
                height={height}
                data-test="progress-graph"
                className='ProgressBarGraph'
            >
                {
                    data.map((barData, i) => {
                        return (
                            <Item
                                key={i}
                                height={sectionHeight}
                                width={availableWidth}
                            >
                                <UpperText fontSize={fontSize}> {barData[label]} </UpperText>
                                <BarSection
                                    direction={(display === PERCENTAGE) ? 'row' : 'column'}
                                >
                                    <InnerBarSection height={barHeight}>
                                        <svg style={{ width: barWidth, height: barHeight }}>
                                            <g>
                                                <rect
                                                    width={barWidth}
                                                    height={barHeight}
                                                    fill={backgroundColor}
                                                    data-tip
                                                    data-for={id}
                                                    onMouseOver={() => setHoveredData(barData)}
                                                    onMouseLeave={setHoveredData(null)}
                                                />
                                                <rect
                                                    width={
                                                        getWidth(
                                                            barData,
                                                            barWidth,
                                                            maxData,
                                                            usedData
                                                        )
                                                    }
                                                    height={barHeight}
                                                    fill={
                                                        getColor({
                                                            barData,
                                                            barWidth,
                                                            barColor,
                                                            colorRange,
                                                            maxData,
                                                            usedData
                                                        })
                                                    }
                                                    data-tip
                                                    data-for={id}
                                                    onMouseOver={() => setHoveredData(barData)}
                                                    onMouseLeave={setHoveredData(null)}
                                                />
                                            </g>
                                        </svg>
                                    </InnerBarSection>
                                    <LowerText
                                        fontSize={fontSize}
                                        alignSelf={(display === PERCENTAGE) ? 'center' : 'flex-end'}
                                        marginRight={(sectionHeight === minSectionHeight) ? textWidth * 1.25 : margin.right}
                                    >
                                        {
                                            getData({
                                                barData,
                                                maxData,
                                                usedData,
                                                display,
                                                maxDataFormat,
                                                defaultRange,
                                                units
                                            })
                                        }
                                    </LowerText>
                                </BarSection>
                            </Item>
                        );
                    })
                }
            </Container>
        </React.Fragment>
    );
}

ProgressBarGraph.defaultProps = {
    width: 100,
    height: 100,
    data: [],
    configuration: {}
};

ProgressBarGraph.propTypes = {
    configuration: PropTypes.object,
    data: PropTypes.arrayOf(PropTypes.object),
};

export default compose(
    WithValidationHOC(),
    (WithConfigHOC(config))
)(ProgressBarGraph)
