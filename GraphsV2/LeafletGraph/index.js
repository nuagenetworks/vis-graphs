import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Map, TileLayer, Marker, Tooltip } from "react-leaflet";
import isEqual from 'lodash/isEqual';
import MarkerClusterer from "react-leaflet-markercluster";
import { compose } from 'redux';
import 'react-leaflet-markercluster/dist/styles.min.css';
import L from 'leaflet';

import WithConfigHOC from '../../HOC/WithConfigHOC';
import WithValidationHOC from '../../HOC/WithValidationHOC';
import SearchBar from "../../SearchBar";
import { getIconPath } from '../../utils/helpers';
import { config } from './default.config';
import { styled } from '@material-ui/core/styles';
import './styles.css';

const InfoContainer = styled('div')({
  display: 'table'
});

const InfoBox = styled('div')({
  display: 'table-row'
});

const Label = styled('small')({
  fontSize: 9,
  color: 'rgb(106, 106, 106)',
  whiteSpace: 'nowrap',
  display: 'table-cell',
  marginRight: '10px'
});

const Data = styled('small')({
  whiteSpace: 'nowrap',
  display: 'table-cell',
  marginLeft: '10px'
});

// call on marker click
const handleMarkerClick = (data, onMarkClick) => {
  return onMarkClick ? onMarkClick(data) : "";
}

const LeafletGraph = (props) => {

  const [stateData, setStateData] = useState([]);
  const [infowindow, setInfowindow] = useState({ data: null, position: null });

  useEffect(() => {
    initiate(props);
  }, [props.data]);

  const {
    data,
    width,
    properties,
    onMarkClick,
  } = props;

  let {
    height,
  } = props;

  const {
    searchBar,
    maxZoom,
    minZoom,
    latitudeColumn,
    longitudeColumn,
    idColumn,
    markerIcon,
    filters,
    tooltip,
  } = properties;

  const initiate = (props) => {
    //markers = new Map();
    setStateData(props.data);
    setInfowindow({ data: null, position: null });
  }

  // toggle info window on marker click
  const toggleInfoWindow = (data = null, position = null) => {
    if (!data || !isEqual(position, infowindow.position)) {
      setInfowindow({ data, position });
    }
  }

  const displayNSGInfo = (data) => {
    const displayInfo = (info, data) => {
      return info.map((row, i) => (
      <InfoBox key={i}>
          <Label>{row.label}</Label>
          <Data>&nbsp;</Data>
          <Data>{data[row.column] || 'None'}</Data>
        </InfoBox>
      ))
    }

    return (
      <InfoContainer className={'geoGraph'}>
        {
          displayInfo(tooltip, data)
        }
      </InfoContainer>
    )
  }

  // popup info window on marker's click
  const renderInfowindow = () => {
    const { data } = infowindow;

    return (
      data && (
        <Tooltip>
          {displayNSGInfo(data)}
        </Tooltip>
      )
    )
  }

  // draw markers on map
  const renderMarkersIfNeeded = () => {
    return stateData.filter(d => {
      return (d[latitudeColumn] && d[longitudeColumn]);
    }).map(d => {
      return drawMarker({
        data: { ...d },
        position: [
          d[latitudeColumn],
          d[longitudeColumn]
        ]
      })
    });
  }

  const drawMarker = ({ data, position, labelOrigin = null }) => {
    const iconData = getIconPath(markerIcon, data);
    const iconPerson = new L.Icon({
      iconUrl: iconData.url,
      iconAnchor: labelOrigin,
    });

    return (
      <Marker
        key={data[idColumn]}
        position={position}
        icon={iconPerson}
        onClick={() => handleMarkerClick(data, onMarkClick)}
        onMouseOver={tooltip ? () => toggleInfoWindow(data, position) : ''}
        onMouseOut={tooltip ? () => toggleInfoWindow() : ''}
      >
        {renderInfowindow()}
      </Marker>
    )
  }

  // handle response after searching
  const handleSearch = (data, isSuccess) => {
    if (isSuccess && !isEqual(stateData, data)) {
      setStateData(data);
    }
  }

  const renderSearchBarIfNeeded = () => {
    if (searchBar === false) {
      return;
    }

    return (
      <SearchBar
        data={data}
        options={filters}
        handleSearch={handleSearch}
      />
    );
  }

  const createClusterCustomIcon = (clusters) => {
    const count = clusters.getChildCount();

    return L.divIcon({
      html:
        `<div>
              <img src='/icons/GREY.png'>
                <span class="markerClusterLabel">${count}</span>
              </img>
          </div>`,
      className: 'markerCluster',
    });
  }

  const currentCenter = [
    Number(process.env.REACT_APP_MAP_LAT),
    Number(process.env.REACT_APP_MAP_LNG),
  ]

  if (searchBar !== false) {
    height -= 70;
  }

  return (
    <React.Fragment>
      {renderSearchBarIfNeeded()}
      {
        <Map
          center={currentCenter}
          zoom={minZoom}
          maxZoom={maxZoom}
          style={{ height, width }}
          className="markercluster-map"
        >
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MarkerClusterer
            iconCreateFunction={createClusterCustomIcon}
            showCoverageOnHover={false}
          >
            {renderMarkersIfNeeded()}
          </MarkerClusterer>
        </Map>
      }
    </React.Fragment>
  )
}

LeafletGraph.propTypes = {
  data: PropTypes.array,
};

export default compose(
  WithValidationHOC(),
  (WithConfigHOC(config))
)(LeafletGraph);
