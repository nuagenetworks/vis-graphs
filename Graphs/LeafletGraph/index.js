import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Map, TileLayer, Marker, Tooltip, Polyline } from "react-leaflet";
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
import { theme } from '../../theme';

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
  const [line, setLine] = useState([]);
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
    links,
  } = properties;

  const initiate = (props) => {
    setStateData(props.data);
    setLine([]);
    setInfowindow({ data: null, position: null });
  }

  // toggle info window on marker click
  const toggleInfoWindow = (data = null, position = null) => {
    if (!data || !isEqual(position, infowindow.position)) {
      setInfowindow({ data, position });
    }
  }

  const displayEntityInfo = (data) => {
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
          {displayEntityInfo(data)}
        </Tooltip>
      )
    )
  }

  // draw markers on map
  const renderMarkers = () => {
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
        attribution={data[idColumn]}
        position={position}
        icon={iconPerson}
        onClick={() => handleMarkerClick(data, onMarkClick)}
        onMouseOver={tooltip ? () => toggleInfoWindow(data, position) : undefined}
      >
        {renderInfowindow()}
      </Marker>
    )
  }

  // handle response after searching
  const handleSearch = (data, isSuccess) => {
    if (isSuccess && !isEqual(stateData, data)) {
      setStateData(data);
      setLine([]);
    }
  }

  const renderSearchBar = () => {
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

  const handleClustererClick = (clusters) => {
    const markers = [];

    // get all markers from all clusters
    clusters.layer.getAllChildMarkers().forEach(cluster => {
      markers.push({
        name: cluster.options.attribution,
        position: { lat: cluster.options.position[0], lng: cluster.options.position[1] }
      });
    });

    calculatePolylines(markers);
  }

  const calculatePolylines = (currentMarkers) => {

    if (links && links.source && props[links.source].length) {

      const polylines = [];
      props[links.source].forEach(line => {

        let destMarker = null;
        let sourceMarker = null;

        if (line[links.destinationColumn] && line[links.sourceColumn]) {
          // check link source and destination id's in marker list to get marker's latlng
          const dest = currentMarkers.find(marker => marker.name === line[links.destinationColumn]);
          const source = currentMarkers.find(marker => marker.name === line[links.sourceColumn]);
          if (!destMarker && dest) {
            destMarker = dest.position;
          }

          if (!sourceMarker && source) {
            sourceMarker = source.position;
          }

          // if any source or destintion point not found in bound, then find lat lng in data
          if (!destMarker && sourceMarker) {
            
            const destination = stateData.find(d => d[idColumn] === line[links.destinationColumn])

            if (destination) {
              destMarker = {
                lat: destination[latitudeColumn],
                lng: destination[longitudeColumn],
              }
            }
          }

          // if any source or destintion point not found in bound, then find lat lng in data
          if (!sourceMarker && destMarker) {
            const source = stateData.find(d => d[idColumn] === line[links.sourceColumn]);

            if (source) {
              sourceMarker = {
                lat: source[latitudeColumn],
                lng: source[longitudeColumn],
              }
            }
          }

          if (destMarker && sourceMarker) {
            if (!isPolylineExist(polylines, sourceMarker, destMarker)) {
              polylines.push({
                source: { lat: sourceMarker.lat, lng: sourceMarker.lng },
                destination: { lat: destMarker.lat, lng: destMarker.lng },
                color: line.color || theme.palette.redColor,
              })
            }
          }
        }

      })
      setLine(polylines);
    }
  }

  // check line is already drawn or not
  const isPolylineExist = (polylines, sourceMarker, destMarker) => {
    return polylines.some(el => {
      return ((el.source.lat === sourceMarker.lat && el.source.lng === sourceMarker.lng) && (el.destination.lat === destMarker.lat && el.destination.lng === destMarker.lng));
    });
  }

  const renderPolyline = () => {
    return line.map((link, i) => {
      return <Polyline
        color= {link.color}
        positions={[
          [link.source.lat, link.source.lng],
          [link.destination.lat, link.destination.lng]
        ]}
      />
    })
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
      {renderSearchBar()}
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
            spiderfyOnMaxZoom={true}
            onClusterClick={handleClustererClick}
          >
            {renderMarkers()}
            {renderPolyline()}
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
