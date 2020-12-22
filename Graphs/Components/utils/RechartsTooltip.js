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

export default ({ tooltip, tooltipKey, yColumn, stack, groupedKeys }) => {
    if (!isEmpty(tooltip)) {
        return (<Tooltip
            content={
                <TooltipComponent tooltip={tooltip} tooltipKey={tooltipKey} yColumn={yColumn} stack={stack} groupedKeys={groupedKeys} />
            }
            wrapperStyle={{ backgroundColor: "black" }}
        />)
    }
}

const TooltipComponent = (props) => {
    const { tooltip, payload, tooltipKey, yColumn, stack, groupedKeys } = props;
    return (
        <Container>
            {!isEmpty(tooltip) && payload && payload.length && tooltip.map((element, index) => {
                let col;
                let elementKey = element.column || element.label;
                if (elementKey === 'yColumn') {
                    elementKey = payload[0].name;
                    col = payload[0];
                }
                if(tooltipKey && tooltipKey !== -1) {
                    col = payload.find(k => k['name'] === tooltipKey);
                    if(col && !col.payload[elementKey]) {
                        col.payload[elementKey] = tooltipKey;
                    }
                    if(col && yColumn && col.payload[yColumn] && stack) {
                        col.payload[yColumn] = col.value;
                    }
                }
                if(!col) {
                    col = payload[0];
                }
                let columnFormatter = columnAccessor(element);
                if (groupedKeys && yColumn === elementKey) {
                    return groupedKeys.map(Label => {
                        return (
                            <Item
                                key={`tooltip-${index}`}
                            >
                                {Label} : { col['payload'][Label] !== undefined ? col['payload'][Label] && (columnFormatter(col['payload'][Label])) : col.name}
                            </Item>
                        )
                    });
                }

                return (
                    <Item
                        key={`tooltip-${index}`}
                    >
                        {element.label || element.column} : { col['payload'][elementKey] !== undefined ? col['payload'][elementKey] && (columnFormatter(col['payload'][elementKey])) : col.name}
                    </Item>
                )
            })}
        </Container>
    )
}
