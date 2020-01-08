import PropTypes from 'prop-types';
import React from 'react';
import { styled } from '@material-ui/core/styles';
import objectPath from 'object-path';
import { config } from './default.config';
import { compose } from 'redux'

import WithConfigHOC from '../../HOC/withConfigHOC';
import WithDataHOC from '../../HOC/withDataHOC';

/*
    This is a very basic graph that displays a text message
*/

const Container = styled('div')({
    fontSize: ({properties : {fontSize}} = {}) => fontSize,
    fontWeight: ({properties: {fontWeight}} = {}) => fontWeight,
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "flex-end",
});

const Item = styled('div')({
    paddingLeft: "0.6rem",
    paddingBottom: "0.3rem",
});

const handleMarkerClick = (props, e) => {
    e.stopPropagation();
    const { data, onMarkClick } = props;
    if (data && Array.isArray(data) && data.length && onMarkClick) {
        onMarkClick(data[0]);
    }
    return {};
}

const SimpleTextGraph = (props) => {
    const {
        data,
        properties,
    } = props;

    const targetedColumn = properties.targetedColumn;

    return (
        <Container
            onClick={(event) => handleMarkerClick(props, event)}
            properties={properties}
        >
            <Item>
                {targetedColumn ? objectPath.get(data[0], targetedColumn) : data.length}
            </Item>
        </Container>
    );
}

SimpleTextGraph.propTypes = {
    configuration: PropTypes.object,
    data: PropTypes.array,
};

export default compose(
    WithDataHOC(),
    (WithConfigHOC(config))
)(SimpleTextGraph)
