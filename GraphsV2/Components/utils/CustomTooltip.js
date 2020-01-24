import React from 'react';
import { styled } from '@material-ui/core/styles';
import { Tooltip } from 'recharts';

const Container = styled('div')({
    marginLeft: '0.5rem',
    marginRight: '0.5rem',
});

const Item = styled('p')({
    color: 'white',
});

export default ({ tooltip }) => {
    if (tooltip) {
        return (<Tooltip
            content={
                <TooltipComponent tooltip={tooltip} />
            }
            wrapperStyle={{ backgroundColor: "black" }}
        />)
    }
}

const TooltipComponent = ({ tooltip, payload }) => {
    return (
        <Container>
            {tooltip && payload.length && tooltip.map((element, index) => (
                <Item className="label">
                    {element.label || element.column} :
                        {(payload[0]['payload'][element.column]) || payload[0].name}
                </Item>
            ))}
        </Container>
    )
}
