import React from 'react';
import ReactTooltip from "react-tooltip";

import columnAccessor from "../../utils/columnAccessor";

export default (properties) => {

    let getTooltipContent, tooltipProps, toolTip, hoveredDatum, tooltipId;

    const setTooltipAccessor = (tooltip, yTicksLabel) => {
        if (!tooltip) {
            return;
        }

        // This function is invoked to produce the content of a tooltip.
        getTooltipContent = () => {
            // The value of this.hoveredDatum should be set by subclasses
            // on mouseEnter and mouseMove of visual marks
            // to the data entry corresponding to the hovered mark.

            if (hoveredDatum) {
                return tooltipContent({ tooltip, accessors: tooltip.map(columnAccessor), yTicksLabel });
            } 
            
            return;
        }
    }

    const tooltipContent = ({ tooltip, accessors, yTicksLabel }) => {

        if (!yTicksLabel || typeof yTicksLabel !== 'object') {
            yTicksLabel = {};
        }

        if (!Array.isArray(tooltip)) {
            return null;
        }

        return (
            /* Display each tooltip column as "label : value". */
            tooltip.map(({ column, label }, i) => {
                const data = accessors[i](hoveredDatum)

                return (data !== null && data !== 'undefined') ?
                    (<div key={column}>
                        <strong>
                            {/* Use label if present, fall back to column name. */}
                            {label || column}
                        </strong> : <span>
                            {/* Apply number and date formatting to the value. */}
                            {yTicksLabel[data] || data}
                        </span>
                    </div>
                    ) : null
            })

        )
    }

    const handleShowEvent = () => { }

    const handleHideEvent = () => { }

    // Provide tooltips for subclasses.
    const { tooltip, yTicksLabel } = properties;
    if (tooltip) {

        setTooltipAccessor(tooltip, yTicksLabel);

        tooltipId = `tooltip-${new Date().valueOf()}`;

        // This JSX object can be used by subclasses to enable tooltips.
        toolTip = (
            <ReactTooltip
                id={tooltipId}
                place="top"
                type="dark"
                effect="float"
                getContent={[() => getTooltipContent(hoveredDatum), 200]}
                afterHide={() => handleHideEvent()}
                afterShow={() => handleShowEvent()}
                delayUpdate={200}
            />
        );

        // Subclasses can enable tooltips on their marks
        // by spreading over the return value from this function
        // when invoked with the mark's data element `d` like this:
        // data.map((d) => <rect { ...this.tooltipProps(d) } />
        tooltipProps = (d) => ({
            "data-tip": true,
            "data-for": tooltipId,
            "onMouseEnter": () => hoveredDatum = d,
            "onMouseMove": () => hoveredDatum = d
        });

    } else {
        getTooltipContent = () => null
        tooltipProps = () => null
    }

    return { getTooltipContent, tooltipProps, toolTip }
}
