import React from 'react';
import { rgb } from 'd3-color';

const MAX_LABEL_LENGTH = 12;

const getAngle = (group) => ((group.startAngle + group.endAngle) / 2);

export default ({
    componentId,
    chords,
    color,
    arc,
    outerRadius,
    setMouseOverGroup,
    groupLabels,
    labelColors,
    disableHover,
    hoverPersist,
}) => (
        <g className="groups">
            {chords.groups.map((group, groupIndex) => (
                <g
                    key={groupIndex}
                    onMouseOver={(!disableHover && !hoverPersist) ? () => setMouseOverGroup(group.index) : null}
                    onMouseOut={(!disableHover && !hoverPersist) ? () => setMouseOverGroup(null) : null}
                >
                    <path
                        id={`component${componentId}-group${groupIndex}`}
                        fill={`${color(groupIndex)}`}
                        stroke={`${rgb(color(groupIndex)).darker()}`} d={arc(group)}
                    />

                    <text
                        dy=".35em"
                        transform={`rotate(${getAngle(group) * 180 / Math.PI - 90}) translate(${outerRadius + 10}) ${getAngle(group) > Math.PI ? "rotate(180)" : ""}`}
                        fill={labelColors.length === 1 ? labelColors[0] : labelColors[groupIndex]}
                        style={{ textAnchor: (group.startAngle + group.endAngle) / 2 > Math.PI ? "end" : null }}
                    >
                        {
                            groupLabels[groupIndex].length > MAX_LABEL_LENGTH ?
                                groupLabels[groupIndex].substr(0, MAX_LABEL_LENGTH) + '...'
                                : groupLabels[groupIndex]
                        }
                    </text>
                </g>
            ))}
        </g>
    );
