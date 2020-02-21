import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import { compose } from 'redux';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';
import pick from 'lodash/pick';
import { styled } from '@material-ui/core/styles';

import Svg from './Svg';
import Groups from './Groups';
import Ribbons from './Ribbons';
import { config } from './default.config';
import WithConfigHOC from '../../HOC/WithConfigHOC';
import WithValidationHOC from '../../HOC/WithValidationHOC';
import customTooltip from '../utils/customTooltip';

const Tooltip = styled('div')({});

const Container = styled('div')({});

const ChordGraph = (props) => {

    const [stateHoverPersist, setStateHoverPersist] = useState(false);
    const [stateMouseOverGroup, setStateMouseOverGroup] = useState(null);
    const [stateMouseOverRibbon, setStateMouseOverRibbon] = useState(null);
    const [filterData, setFilterData] = useState([]);
    const [customTooltips, setCustomTooltips] = useState({});
    const [hoverData, setHoverData] = useState({ isChord: true });

    const {
        data,
        width,
        height,
        properties,
        onMarkClick
    } = props;

    const {
        componentId,
        padAngle,
        sortGroups,
        sortChords,
        labelColors,
        disableHover,
        disableGroupHover,
        disableRibbonHover,
        strokeWidth,
        resizeWithWindow,
        blurOnHover,
        ribbonOpacity,
        ribbonBlurOpacity,
        chordWeightColumn,
        chordSourceColumn,
        chordDestinationColumn,
        colors,
        additionalKeys,
        bidirectionalTooltip,
        id
    } = properties

    useEffect(() => {
        setCustomTooltips(customTooltip(properties));
        parseData(props.data);
    }, [props.data, props.width, props.height]);

    const parseData = (data) => {

        const filterChordData = data.filter(d => d[chordSourceColumn] && d[chordDestinationColumn])

        if (!isEqual(filterChordData, filterData)) {
            setFilterData(filterChordData);
        }
    }

    const clearHover = () => {
        setStateHoverPersist(false);
        setStateMouseOverGroup(null);
        setStateMouseOverRibbon(null);
    }

    const setHoverPersist = (hoverPersist) => {
        setStateHoverPersist(hoverPersist);
    }

    const setMouseOverGroup = (mouseOverGroup) => {
        setStateMouseOverGroup(mouseOverGroup);
    }

    const weight = function (d) { return d[chordWeightColumn]; };
    const source = function (d) { return d[chordSourceColumn]; };
    const destination = function (d) { return d[chordDestinationColumn]; };
    // Generates a matrix (2D array) from the given data, which is expected to
    // have fields {origin, destination, count}. The matrix data structure is required
    // for use with the D3 Chord layout.

    const generateMatrix = (data) => {
        if (isEmpty(data)) {
            return []
        }

        var indices = {},
            matrix = [],
            names = [],
            matrixData = [],
            n = 0, i, j;

        function recordIndex(name) {
            if (!(name in indices)) {
                indices[name] = n++;
                names.push(name);
            }
        }

        data.forEach(function (d) {
            recordIndex(source(d));
            recordIndex(destination(d));
        });

        for (i = 0; i < n; i++) {
            matrix.push([]);
            matrixData.push([]);
            for (j = 0; j < n; j++) {
                matrix[i].push(0);
                matrixData[i].push([]);
            }
        }

        data.forEach(function (d) {
            i = indices[source(d)];
            j = indices[destination(d)];

            if (chordWeightColumn) {
                matrix[j][i] += weight(d);
            } else {

                // Handle the case where no weight column was specified
                // by making the chord weight fixed on both sides.
                matrix[j][i] = matrix[i][j] = 1;
            }
            matrixData[j][i].push(d);
        });

        matrix.names = names;
        matrix.data = matrixData;

        return matrix;
    }

    const matrix = generateMatrix(filterData);
    const labels = !isEmpty(matrix) ? matrix.names : [];

    const outerRadius = props.outerRadius || Math.min(width, height) * 0.4 - 40;
    const innerRadius = props.innerRadius || outerRadius - 30;

    const d3Chord = d3.chord()
        .padAngle(padAngle)
        .sortGroups(sortGroups)
        .sortChords(sortChords);

    const chords = d3Chord(matrix);

    const d3Arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    const d3Ribbon = d3.ribbon()
        .radius(innerRadius);


    const color = d3.scaleOrdinal()
        .range(colors);

    const ribbonData = (d) => {
        if (d) {
            setHoverData({
                sourceIndex: d.source.index,
                targetIndex: d.target.index,
                source: matrix.names[d.source.index],
                destination: matrix.names[d.target.index],
                sourceValue: d.source.value,
                destinationValue: d.target.value,
                data: [...matrix.data[d.source.index][d.target.index], ...matrix.data[d.target.index][d.source.index]],
                isChord: true,
                isBidirectionalTooltip: bidirectionalTooltip
            });
        } else {
            setHoverData({ isChord: true });
        }
    }

    const handleClick = () => {
        if (onMarkClick && !isEmpty(hoverData)) {
            const { source, destination, data } = hoverData;
            let finalData = [];
            if (additionalKeys) {
                finalData = data.map((d) => pick(d, additionalKeys));
            }
            onMarkClick({
                [chordSourceColumn]: source,
                [chordDestinationColumn]: destination,
                additionalData: uniq(finalData)
            });
        }
    }

    return (
        <Container data-test='chord-graph'>
            <Tooltip> {customTooltips.tooltipWrapper && customTooltips.tooltipWrapper(hoverData)} </Tooltip>
            <Svg
                width={width}
                height={height}
                clearHover={clearHover}
                resizeWithWindow={resizeWithWindow}
                id={id}
            >
                <Groups
                    componentId={componentId}
                    chords={chords}
                    color={color}
                    arc={d3Arc}
                    outerRadius={outerRadius}
                    setMouseOverGroup={setMouseOverGroup}
                    groupLabels={labels}
                    labelColors={labelColors}
                    disableHover={disableHover || disableGroupHover}
                    hoverPersist={stateHoverPersist}
                    setHoverPersist={setHoverPersist}
                />
                <Ribbons
                    chords={chords}
                    color={color}
                    disableHover={disableHover || disableRibbonHover}
                    ribbon={d3Ribbon}
                    setMouseOverRibbon={ribbonData}
                    mouseOverGroup={stateMouseOverGroup}
                    mouseOverRibbon={stateMouseOverRibbon}
                    strokeWidth={strokeWidth}
                    hoverPersist={stateHoverPersist}
                    setHoverPersist={setHoverPersist}
                    onClick={handleClick}
                    blurOnHover={blurOnHover}
                    ribbonOpacity={ribbonOpacity}
                    ribbonBlurOpacity={ribbonBlurOpacity}
                />
            </Svg>
        </Container>
    );
}

ChordGraph.propTypes = {
    configuration: PropTypes.object,
    data: PropTypes.arrayOf(PropTypes.object),
    componentId: PropTypes.number,
};

export default compose(
    WithValidationHOC(),
    (WithConfigHOC(config))
)(ChordGraph);
