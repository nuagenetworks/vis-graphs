import React from 'react';
import { rgb } from 'd3-color';

const isHiddenRibbon = (mouseOverGroup, sourceIndex, targetIndex) => {

    return mouseOverGroup !== null ? (mouseOverGroup !== sourceIndex && mouseOverGroup !== targetIndex) : false;
};

export default ({
    chords,
    color,
    disableHover,
    ribbon,
    setMouseOverRibbon,
    mouseOverGroup,
    mouseOverRibbon,
    hoverPersist,
    setHoverPersist,
    onClick,
    strokeWidth,
    blurOnHover,
    ribbonOpacity,
    ribbonBlurOpacity
}) => (
        <g
            className="ribbons"
            fillOpacity={ribbonOpacity}
        >
            {chords.map((chord, chordIndex) => {
                const hidden = isHiddenRibbon(mouseOverGroup, chord.source.index, chord.target.index) ||
                    isHiddenRibbon(mouseOverRibbon, chordIndex, null);

                const style = (blurOnHover ?
                    { fillOpacity: `${hidden ? ribbonBlurOpacity : ribbonOpacity}` } :
                    { display: `${hidden ? 'none' : 'block'}`, fillOpacity: ribbonOpacity }
                )
                return (
                    <path
                        key={chordIndex}
                        style={style}
                        fill={color(chord.target.index)}
                        stroke={`${rgb(color(chord.target.index)).darker()}`}
                        strokeWidth={strokeWidth}
                        d={`${ribbon({ source: chord.source, target: chord.target })}`}
                        onClick={() => { setHoverPersist(!hoverPersist); onClick(chord) }}
                        onMouseOver={(!disableHover && !hoverPersist) ? () => setMouseOverRibbon(chord) : null}
                        onMouseOut={(!disableHover && !hoverPersist) ? () => setMouseOverRibbon(null) : null}
                    />
                )
            })}
        </g>
    );
