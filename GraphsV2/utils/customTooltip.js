import React from 'react';
import ReactTooltip from "react-tooltip";

import columnAccessor from "../../utils/columnAccessor";

export default (properties) => {

    let getTooltipContent;

    const { tooltip, yTicksLabel, id } = properties;

    const setTooltipAccessor = () => {
        if (!tooltip) {
            return;
        }

        // This function is invoked to produce the content of a tooltip.
        getTooltipContent = (d) => {
            // The value of this.hoveredDatum should be set by subclasses
            // on mouseEnter and mouseMove of visual marks
            // to the data entry corresponding to the hovered mark.
            return d ? tooltipContent(d) : '';
        }
    }

    const tooltipContent = (d) => {
        if (!Array.isArray(tooltip)) {
            return null;
        }

        if (!yTicksLabel || typeof yTicksLabel !== 'object') {
            yTicksLabel = {};
        }

        const accessors = tooltip.map(columnAccessor);

        return (
            /* Display each tooltip column as "label : value". */
            tooltip.map(({ column, label }, i) => {
                const data = accessors[i](d)

                return (data !== null && data !== 'undefined') ?
                    (
                        <div key={column}>
                            <strong>
                                {/* Use label if present, fall back to column name. */}
                                {label || column}
                            </strong> : <span>
                                {/* Apply number and date formatting to the value. */}
                                {yTicksLabel[data] || data}
                            </span>
                        </div>
                    ) : null;
            })
        )
    }

    const tooltipWrapper = (data) => (<ReactTooltip
        id={id}
        place="top"
        type="dark"
        effect="float"
        getContent={[() => getTooltipContent(data), 200]}
        delayUpdate={200}
    />)

    // Provide tooltips for subclasses.
    if (tooltip) {
        setTooltipAccessor(tooltip, yTicksLabel);
        // This JSX object can be used by subclasses to enable tooltips.
        tooltipWrapper(null);

    } else {
        getTooltipContent = () => null
    }

    return { tooltipWrapper }
}
