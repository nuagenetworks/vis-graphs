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

//let markers = new Map();
let timerId = null;

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

    return () => {
      clearTimeout(timerId);
    }
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
    localityColumn,
    nameColumn,
    criticalAlarmColumn,
    majorAlarmColumn,
    minorAlarmColumn,
    bootstrapStatusColumn,
    NSGVersionColumn,
    idColumn,
    markerIcon,
    filters,
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
    const displayInfo = info => {
      return info.map((row, i) => (
        <InfoBox key={i}>
          <Label>{row.label}</Label>
          <Data>&nbsp;</Data>
          <Data>{row.text}</Data>
        </InfoBox>
      ))
    }

    return (
      <InfoContainer className={'geoGraph'}>
        {
          displayInfo([
            { label: 'NSG', text: data[nameColumn] },
            { label: 'Address', text: data[localityColumn] },
            { label: 'Bootstrap Status', text: data[bootstrapStatusColumn] || 'No status found' },
            { label: 'NSG Version', text: data[NSGVersionColumn] || 'No version found' },
            { label: 'Critical Alarms', text: data[criticalAlarmColumn] || 'None' },
            { label: 'Major Alarms', text: data[majorAlarmColumn] || 'None' },
            { label: 'Minor Alarms', text: data[minorAlarmColumn] || 'None' }
          ])
        }
      </InfoContainer>
    )
  }

  // popup info window on marker's click
  const renderInfowindow = () => {
    const { data } = infowindow;

    return (
      data && (
        <Tooltip >
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
        onMouseOver={() => toggleInfoWindow(data, position)}
        onMouseOut={() => toggleInfoWindow()}
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

  const currentCenter = [
    Number(process.env.REACT_APP_GOOGLE_MAP_LAT),
    Number(process.env.REACT_APP_GOOGLE_MAP_LNG),
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
          <MarkerClusterer>
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
