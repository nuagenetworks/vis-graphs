import React from 'react';
import { styled } from '@material-ui/core/styles';
import { Tooltip } from 'recharts';
import isEmpty from 'lodash/isEmpty';
import columnAccessor from '../../../utils/columnAccessor';

const Container = styled('div')({
    marginLeft: '0.5rem',
    marginRight: '0.5rem',
});

const Item = styled('p')({
    color: 'white',
});

export default ({ tooltip, tooltipKey, yColumn }) => {
    if (!isEmpty(tooltip) && tooltipKey !== -1) {
        return (<Tooltip
            content={
                <TooltipComponent tooltip={tooltip} tooltipKey={tooltipKey} yColumn={yColumn} />
            }
            wrapperStyle={{ backgroundColor: "black" }}
        />)
    }
}

const TooltipComponent = (props) => {
    const { tooltip, payload, tooltipKey, yColumn } = props;
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
                  if(col && yColumn && col.payload[yColumn]) {
                    col.payload[yColumn] = col.value;
                  }
              }
              if(!col) {
                col = payload[0];
              }
              let columnFormatter = columnAccessor(element);
              return (
                <Item>
                    {element.label || element.column} :
                        {(columnFormatter(col['payload'][elementKey])) || col.name}
                </Item>
            )})}
        </Container>
    )
}
