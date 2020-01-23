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

const StandardLegend = ({ payload: legends, labelColumn, legend }) => (
    <Container legend={legend}>
        {
            legends.map(({ color, payload, value }, index) => (
                <Item key={`item-${index}`} color={color}>
                    <svg height='0.8rem' width='0.9rem'>
                        <circle cx="7" cy="9" r="3.5" fill={color} />
                    </svg>
                    {payload[labelColumn] || value}
                </Item>
            ))
        }
    </Container>
);

export default StandardLegend;
