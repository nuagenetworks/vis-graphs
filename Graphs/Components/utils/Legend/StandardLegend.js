import React from 'react';
import { styled } from '@material-ui/core/styles';
import * as d3 from "d3";
import max from 'lodash/max';

const Container = styled('div')({
    display: 'flex',
    flexWrap: 'wrap',
    fontSize: ({ legend: { labelFontSize } } = {}) => (
        labelFontSize || '0.6rem'
    ),
    margin: '0.3rem',
});

const Item = styled('div')({
    color: ({ color } = {}) => color,
    flexBasis: ({ legendWidth }) => legendWidth,
    padding: '0.15rem 0',
});

const labelSize = (label, LabelFont = '0.6rem') => {
    const container = d3.select('body').append('svg');
    container.append('text').text(label).style("font-size", LabelFont);
    const dimension = container.node().getBBox();
    container.remove();

    return dimension.width + 30;
}

export default ({ payload: legends, labelColumn, legend, customLegendLabel, containerWidth }) => {
    if (legends && legends[0].value === undefined) {
        return false;
    }

    if (legends.length === 1 && legends[0].payload && legends[0].payload.stackId === undefined) {
        legends = legends[0].payload.children || [legends[0]];
    }

    if (!!customLegendLabel) {
        customLegendLabel.forEach(element => {
            legends.forEach(legend => {
                if (element.column === legend.value) {
                    legend.value = element.label;
                }
            });
        });
    }

    const legendWidth = containerWidth ? `${highestLabel/containerWidth * 100}%` : '50%';

    const highestLabel = max(legends.map( ({payload, value}) => {
        const label = labelColumn ? payload[labelColumn] : value;
        
        return labelSize(label);
    }));

    return (
        <Container legend={legend}>
            {
                legends.map(({ color, payload, value, props: { fill, name: { xVal } = {} } = {} }, index) => (
                    <Item key={`legend-${index}`} color={color || fill} legendWidth={legendWidth}>
                        <svg height='0.8rem' width='0.9rem'>
                            <circle cx="7" cy="9" r="3.5" fill={color || fill} />
                        </svg>
                        {(payload && payload[labelColumn] || value) || xVal}
                    </Item>
                ))
            }
        </Container>
    )
}
