import React from 'react';
import ReactTooltip from "react-tooltip";

import columnAccessor from "../../utils/columnAccessor";

export default (properties) => {

    let getTooltipContent;

    const setTooltipAccessor = (tooltip, yTicksLabel) => {
        if (!tooltip) {
            return;
        }

        // This function is invoked to produce the content of a tooltip.
        getTooltipContent = (d) => {
            // The value of this.hoveredDatum should be set by subclasses
            // on mouseEnter and mouseMove of visual marks
            // to the data entry corresponding to the hovered mark.
            if(!d.isChord) {
                return (d) ? tooltipContent({ tooltip, accessors: tooltip.map(columnAccessor), yTicksLabel, d }) : '';
            } else {
                if(d.destination) {
                    const { accessor, label } = (
                        (tooltip && tooltip.length === 1)
                        ? { accessor: columnAccessor(tooltip[0]), label: tooltip[0].label }
                        : { accessor: (d) => d.value, label: undefined }
                    );
                    return chordTooltipContent(d, accessor, label)
                } else {
                    return <div>Hover over a chord to see flow details.</div>;
                }
            }
        }
    }

    const tooltipContent = ({ tooltip, accessors, yTicksLabel, d }) => {

        if (!yTicksLabel || typeof yTicksLabel !== 'object') {
            yTicksLabel = {};
        }

        if (!Array.isArray(tooltip)) {
            return null;
        }

        return (
            /* Display each tooltip column as "label : value". */
            tooltip.map(({ column, label }, i) => {
                const data = accessors[i](d)

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
                    ) : null;
            })
        )
    }

    const { tooltip, yTicksLabel, id } = properties;

    const chordTooltipContent = (data, accessor, label) => {
        const {
            source,
            destination,
            sourceValue,
            destinationValue,
            isBidirectionalTooltip
        } = data;

        return (
            <React.Fragment>
                {renderTooltipContent(destination, source, sourceValue, accessor, label)}
                {isBidirectionalTooltip && renderTooltipContent(source, destination, destinationValue, accessor, label)}
            </React.Fragment>
        );
    }

    const renderTooltipContent = (from, to, value, accessor, label) => (
        <div>
            <strong>{`${from} to ${to}:`}</strong>
            <span> {accessor({value})}</span>
            {label ? <span> {label}</span>:null}
        </div>
    );

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
