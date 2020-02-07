import PropTypes from 'prop-types';
import React, { useEffect, useState } from "react";
import { compose } from 'redux';
import { format } from "d3";
import { styled } from '@material-ui/core/styles';

import WithConfigHOC from '../../HOC/WithConfigHOC';
import WithValidationHOC from '../../HOC/WithValidationHOC';
import { config } from "./default.config";

const d3 = { format };

const Container = styled('div')({
    fontSize: ({ properties: { fontSize } } = {}) => fontSize,
    fontWeight: ({ properties: { fontWeight } } = {}) => fontWeight,
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "flex-end",
});

const Item = styled('div')({
    paddingLeft: "0.6rem",
    paddingBottom: "0.3rem",
});

const Label = styled('span')({
    paddingLeft: ({ paddingLeft } = {}) => paddingLeft,
    color: ({ color } = {}) => color,
});

const handleMarkerClick = (props, e) => {
    e.stopPropagation();
    const { data, onMarkClick } = props;
    if (data && Array.isArray(data) && data.length && onMarkClick) {
        onMarkClick(data[0]);
    }
    return {};
}

const VariationTextGraph = (props) => {
    const [settingValue, setSettingValue] = useState(null);
    const [settingColor, setSettingColor] = useState(null);

    useEffect(() => {
        initialize(props);
    }, [props.data, props.context]);

    const {
        properties
    } = props;

    const {
        target,
        absolute,
        showVariation
    } = properties;

    const initialize = (props) => {
        const {
            data,
            properties,
        } = props;

        const {
            target,
            positiveColors,
            negativeColors,
            drawColors,
        } = properties;

        setSettingValue(computeValues(data, target));

        if (!settingValue)
            return;

        setSettingColor(drawColors);

        if (settingValue.variation > 0) {
            setSettingColor(positiveColors);
        }

        if (settingValue.variation < 0) {
            setSettingColor(negativeColors);
        }
    }

    const computeValues = (data, target) => {
        if (!data || !target)
            return;

        let lastInfo = {},
            previousInfo = {};

        data.forEach((d) => {
            if (d[target.column] === target.value)
                lastInfo = d;
            else
                previousInfo = d;
        })

        const lastValue = lastInfo[target.field];
        const previousValue = previousInfo[target.field];
        const variation = lastValue - previousValue;

        return {
            lastValue,
            previousValue,
            variation: variation !== 0 ? variation * 100 / previousValue : 0
        }
    }

    const numberWithCommas = (x) => {
        return x && x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    const formattedValue = (x, format) => {
        let formatter = d3.format(format);
        return formatter(x);
    }

    const decimals = (x, nb = 2) => {
        return x.toFixed(nb)
    }

    const getFormattedValue = (x, target) => {
        return (target.format) ? formattedValue(x, target.format) : numberWithCommas(x);
    }

    const renderValues = (absolute, showVariation) => {
        if (!settingValue)
            return;

        const lastValue = getFormattedValue(settingValue.lastValue, target);
        const previousValue = getFormattedValue(settingValue.previousValue, target);
        const info = !absolute ? lastValue : `${lastValue}/${previousValue}`;

        return (
            <>
                <Label>
                    {info || info === 0 ? info : 'NaN'}
                </Label>
                {showVariation &&
                    <Label paddingLeft='0.25rem' color={settingColor ? settingColor : null} >
                        {`(${decimals(settingValue.variation)}%)`}
                    </Label>
                }
            </>
        );
    }

    return (
        <Container
            onClick={(event) => handleMarkerClick(props, event)}
            properties={properties}
        >
            <Item>
                {renderValues(absolute, showVariation)}
            </Item>
        </Container>
    );
}

VariationTextGraph.propTypes = {
    configuration: PropTypes.object,
    data: PropTypes.array
};

export default compose(
    WithValidationHOC(),
    (WithConfigHOC(config))
)(VariationTextGraph);
