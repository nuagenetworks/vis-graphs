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

export default ({ tooltip, tooltipKey, yColumn, linesColumn }) => {
    if (!isEmpty(tooltip) && tooltipKey !== -1) {
        return (<Tooltip
            content={
                <TooltipComponent tooltip={tooltip} tooltipKey={tooltipKey} yColumn={yColumn} linesColumn={linesColumn} />
            }
            wrapperStyle={{ backgroundColor: "black" }}
        />)
    }
}

const TooltipComponent = (props) => {
    const { tooltip, payload, yColumn, linesColumn, xColumn } = props;
    return (
        <Container>
            {!isEmpty(tooltip) && payload && payload.length && Object.entries(payload[0].payload).map((element, index) => {
                if (element[0] !== xColumn && element[0] !== yColumn && element[0] !== linesColumn) {
                    let label = element[0]; 
                    let col = tooltip.find(k => k['column'] === label);
                    let columnFormatter;
                    if(col) {
                        columnFormatter = columnAccessor(col);
                        label = col.label || col.column
                    } else {
                        col =  tooltip.find(k => k['column'] === yColumn);
                        columnFormatter = columnAccessor(col);
                    }
                    return (
                        <Item
                            key={`tooltip-${index}`}
                        >
                            {label} : {columnFormatter(element[1])}
                        </Item>
                    )
                }
                
            })}
            
        </Container>
    )
}
