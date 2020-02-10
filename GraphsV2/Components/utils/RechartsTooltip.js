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

export default ({ tooltip, tooltipName }) => {
    if (tooltip && tooltipName != -1) {
        return (<Tooltip
            content={
                <TooltipComponent tooltip={tooltip} tooltipKey={tooltipName} />
            }
            wrapperStyle={{ backgroundColor: "black" }}
        />)
    }
}

const TooltipComponent = (props) => {
    const { tooltip, payload, tooltipKey } = props;
    return (
        <Container>
            {tooltip && payload && payload.length && tooltip.map((element, index) => {
              let col;
              let elementKey = element.column || element.label;
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
                <Item className="label">
                    {element.label || element.column} :
                        {(col['payload'][elementKey]) || col.name}
                </Item>
            )})}
        </Container>
    )
}
