import React from 'react';
import { styled } from '@material-ui/core/styles';
import { Tooltip } from 'recharts';
import isEmpty from 'lodash/isEmpty';

const Container = styled('div')({
    marginLeft: '0.5rem',
    marginRight: '0.5rem',
});

const Item = styled('p')({
    color: 'white',
});

export default ({ tooltip, tooltipKey }) => {
    if (!isEmpty(tooltip) && tooltipKey !== -1) {
        return (<Tooltip
            content={
                <TooltipComponent tooltip={tooltip} tooltipKey={tooltipKey} />
            }
            wrapperStyle={{ backgroundColor: "black" }}
        />)
    }
}

const TooltipComponent = (props) => {
    const { tooltip, payload, tooltipKey } = props;
    return (
        <Container>
            {!isEmpty(tooltip) && payload && payload.length && tooltip.map((element, index) => {
              let col;
              const elementKey = element.column || element.label;
              if(tooltipKey) {
                  col = payload.find(k => k['name'] === tooltipKey);
                  if(col && !col.payload[elementKey]) {
                    col.payload[elementKey] = tooltipKey;
                  }
              }
              if(!col) {
                col = payload[0];
              }
              return (
                <Item>
                    {element.label || element.column} :
                        {(col['payload'][elementKey]) || col.name}
                </Item>
            )})}
        </Container>
    )
}
