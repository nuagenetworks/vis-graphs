import React from 'react';
import { styled } from '@material-ui/core/styles';
import { Tooltip } from 'recharts';
import isEmpty from 'lodash/isEmpty';
import cloneDeep from 'lodash/cloneDeep';

import columnAccessor from '../../../utils/columnAccessor';
import { isVariableNonNullAndDefined } from '../../../../../utils';

const Container = styled('div')({
    marginLeft: '0.5rem',
    marginRight: '0.5rem',
});

const Item = styled('p')({
    color: 'white',
});

export default ({ tooltip, tooltipKey, yColumn, stack, groupedKeys, graph, activeDotOnlyTooltip }) => {
    if (!isEmpty(tooltip)) {
        return (<Tooltip
            content={
                <TooltipComponent
                    tooltip={tooltip}
                    tooltipKey={tooltipKey}
                    yColumn={yColumn}
                    stack={stack}
                    groupedKeys={groupedKeys}
                    graph={graph}
                    activeDotOnlyTooltip={activeDotOnlyTooltip}
                />
            }
            wrapperStyle={{ backgroundColor: "black" }}
        />)
    }
}

const TooltipComponent = (props) => {
    const { tooltip, payload, tooltipKey, yColumn, stack, groupedKeys, graph, activeDotOnlyTooltip } = props;
    return (
        <Container>
            {!isEmpty(tooltip) && payload && payload.length && tooltip.map((element, index) => {
                let col;
                let elementKey = element.column || element.label;
                if (elementKey === 'yColumn') {
                    elementKey = payload[0].name;
                    col = payload[0];
                }
                if (tooltipKey && tooltipKey !== -1) {
                    col = cloneDeep(payload.find(k => k['name'] === tooltipKey));
                    if (!payload.hasOwnProperty(elementKey) && yColumn.includes(elementKey) && graph === 'MultiLineGraph') {
                        elementKey = tooltipKey;
                    }
                    if (col && !col.payload.hasOwnProperty(elementKey)) {
                        col.payload[elementKey] = tooltipKey;
                    }
                    if(col && yColumn && col.payload[yColumn] && stack) {
                        col.payload[yColumn] = col.value;
                    }
                }
                if(!col) {
                    if (activeDotOnlyTooltip) {
                        return null;
                    }
                    col = payload[0];
                }
                let columnFormatter = columnAccessor(element);
                if (groupedKeys && yColumn === elementKey) {
                    return groupedKeys.map(label => {
                        return (
                            <Item
                                key={`tooltip-${index}`}
                            >
                                {label} : { isVariableNonNullAndDefined(col['payload'][label]) ? (columnFormatter(col['payload'][label])) : col.name }
                            </Item>
                        )
                    });
                }

                return (
                    <Item
                        key={`tooltip-${index}`}
                    >
                        { element.label || element.column } : { isVariableNonNullAndDefined(col['payload'][elementKey]) ? (columnFormatter(col['payload'][elementKey])) : col.name }
                    </Item>
                )
            })}
        </Container>
    )
}
