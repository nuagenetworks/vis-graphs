import React from 'react';
import { styled } from '@material-ui/core/styles';

const Container = styled('div')({
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: ({ legend: { labelFontSize } } = {}) => (
        labelFontSize || '0.6rem'
    ),
});

const Item = styled('div')({
    color: ({ color } = '') => color,
    padding: '0 0.5rem',
});

const PercentageLegend = ({ payload: legends, legend, labelColumn }) => (
    <>
        {
            legends.map(({ color, payload }, index) => (
                <Container legend={legend}>
                    <Item key={`item-${index}`} color={color}>
                        <svg height='0.8rem' width='0.9rem'>
                            <circle cx="7" cy="9" r="3.5" fill={color} />
                        </svg>
                        {payload[labelColumn]}
                    </Item>
                    <Item key={`item-${index}`} color={color}>
                        {`${(payload.percent * 100).toFixed(2)} %`}
                    </Item>
                </Container>
            ))
        }
    </>
)

export default PercentageLegend;
