import React from 'react';
import { styled } from '@material-ui/core/styles';

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
    flexBasis: '50%',
    padding: '0.15rem 0',
});

export default ({ payload: legends, labelColumn, legend, customLegendLabel }) => {
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

    return (
        <Container legend={legend}>
            {
                legends.map(({ color, payload, value, props: { fill, name: { xVal } = {} } = {} }, index) => (
                    <Item key={`legend-${index}`} color={color || fill}>
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
