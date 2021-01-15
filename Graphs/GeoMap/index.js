import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Marker, InfoWindow, Polyline } from 'react-google-maps';
import isEqual from 'lodash/isEqual';
import MarkerClusterer from "react-google-maps/lib/components/addons/MarkerClusterer";
import { compose } from 'redux';

import WithConfigHOC from '../../HOC/WithConfigHOC';
import WithValidationHOC from '../../HOC/WithValidationHOC';
import GoogleMapsWrapper from '../../Map';
import SearchBar from "../../SearchBar";
import { getIconPath } from '../../utils/helpers';
import { config } from './default.config';
import { theme } from '../../theme';
import { styled } from '@material-ui/core/styles';

let markers = new Map();
let MarkerCenter = null;
let googleMap = null;
let clusterCenter = null;
let timerId = null;
let clusterZoom = null;

const WrongApikEey = styled('div')({
  position: 'absolute',
  top: '50%',
  left: '30%',
  fontSize: '14px'
});

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

const GeoMap = (props) => {

  const [stateData, setStateData] = useState([]);
  const [infowindow, setInfowindow] = useState({ data: null, position: null });
  const [line, setLine] = useState([]);
  const [defaultCenter, setDefaultCenter] = useState(null);
  const [spiderifyMarkers, setSpiderfyMarkers] = useState([]);
  const [spiderifyLines, setSpiderifyLines] = useState([]);

  useEffect(() => {
    initiate(props);

    return () => {
      clearTimeout(timerId);
    }

  }, [props.data]);

  const {
    data,
    height,
    properties,
    googleMapURL,
    googleMapsAPIKey,
    onMarkClick,
  } = props;

  const {
    searchBar,
    maxZoom,
    minZoom,
    mapStyles,
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
    urgency,
    links,
    filters,
  } = properties;

  const initiate = (props) => {
    clusterCenter = null;
    markers = new Map();
    setStateData(props.data);
    setInfowindow({ data: null, position: null });
    setLine([]);
    setDefaultCenter(null);
    setSpiderfyMarkers([]);
    setSpiderifyLines([]);
  }

  const onMapMounted = (map) => {
    if (!map) {
      return;
    }

    googleMap = map;
  }

  const onBoundsChanged = () => {
    const bounds = new window.google.maps.LatLngBounds();
    let shouldFitToBounds = false;

    stateData.forEach(marker => {
      if (marker[latitudeColumn] && marker[longitudeColumn]) {
        bounds.extend(new window.google.maps.LatLng(marker[latitudeColumn], marker[longitudeColumn]));
        shouldFitToBounds = true;
      }
    });

    const newCenter = bounds.getCenter().toJSON();

    if (newCenter && !isEqual(MarkerCenter, newCenter)) {

      if (!MarkerCenter && shouldFitToBounds) {
        googleMap.fitBounds(bounds);
      }

      MarkerCenter = newCenter;
      setDefaultCenter(newCenter);
    }
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
    const { data, position } = infowindow;

    return (
      data && (
        <InfoWindow
          position={position}
          options={{
            pixelOffset: new window.google.maps.Size(0, -25)
          }}
          onCloseClick={() => toggleInfoWindow}>
          {displayNSGInfo(data)}
        </InfoWindow>
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
        position: {
          lat: d[latitudeColumn],
          lng: d[longitudeColumn]
        }
      })
    });
  }

  const drawMarker = ({ data, position, labelOrigin = null }) => {
    const iconData = getIconPath(markerIcon, data);

    return (
      <Marker
        noRedraw={false}
        options={{
          id: data[idColumn],
          data,
          urgency: iconData.urgency,
        }}
        key={data[idColumn]}
        position={position}
        onClick={() => handleMarkerClick(data, onMarkClick)}
        onMouseOver={() => toggleInfoWindow(data, position)}
        onMouseOut={() => toggleInfoWindow()}
        icon={{
          url: iconData.url,
          labelOrigin,
          anchor: labelOrigin,
        }}
      />
    )
  }

  const handleClusterClick = (cluster) => {
    const zoom = googleMap.getZoom();

    //Tracking Zoom of the Cluster, when it clicked and not at finalzoom,
    //Used to go back to that stage in case of Zoom out from MAX level
    if (zoom < maxZoom) {
      clusterZoom = googleMap.getZoom();
    }

    const markers = cluster.getMarkers();
    if (zoom >= maxZoom && markers.length > 1) {

      // check the cluster that is already expanded or not, if yes than collapse the clicked cluster
      if (clusterCenter && isEqual(clusterCenter.toJSON(), cluster.getCenter().toJSON())) {

        clusterCenter = null;
        setSpiderfyMarkers([]);
        setSpiderifyLines([]);

      } else {

        clusterCenter = cluster.getCenter();
        const projection = googleMap.getProjection();
        const centerPoint = projection.fromLatLngToPoint(clusterCenter)

        let radius = 0.0002;
        let step = markers.length < 10 ? markers.length : 10, counter = 0, remaining = markers.length;
        let theta = ((Math.PI * 2) / step);

        const spiderifyMarkers = markers.map(marker => {
          counter++;

          const angle = (theta * counter);
          const x = (radius * Math.cos(angle)) + centerPoint.x;
          const y = (radius * Math.sin(angle)) + centerPoint.y;
          const point = projection.fromPointToLatLng(new window.google.maps.Point(x, y)).toJSON();

          if (counter === step) {
            remaining -= step;
            step += 5;
            if (remaining < step) {
              step = remaining;
            }

            counter = 0;
            radius += 0.00012;
            theta = ((Math.PI * 2) / step);
          }

          return drawMarker({
            data: Object.assign({}, marker.data, { spiderify: true }),
            position: point,
            labelOrigin: new window.google.maps.Point(13, 13),
          })
        })

        const spiderifyLines = spiderifyMarkers.map((marker, i) => {
          return (
            <Polyline
              key={i}
              defaultVisible={true}
              options={{
                strokeColor: theme.palette.orangeLightColor,
                strokeOpacity: 1.0,
                strokeWeight: 1.2,
              }}
              path={[
                clusterCenter.toJSON(),
                marker.props.position,
              ]}
            />
          )
        })

        setSpiderfyMarkers(spiderifyMarkers);
        setSpiderifyLines(spiderifyLines);
      }
    }
  }

  const handleClustererEnd = (clusters) => {
    clearTimeout(timerId);
    const currentMarkers = new Map();

    // get all markers from all clusters
    clusters.getClusters().forEach(cluster => {
      cluster.getMarkers().forEach(d => {
        currentMarkers.set(d.id, cluster.getCenter().toJSON());
      })
    });

    timerId = setTimeout(() => setClusterIcons(clusters), 100);

    if (!isEqual(markers, currentMarkers)) {
      calculatePolylines(markers = currentMarkers);
    }
  }

  const setClusterIcons = (clusters) => {
    clusters.getClusters().forEach(cluster => {
      const clusterMarkers = cluster.getMarkers();
      const urgencyData = {};

      clusterMarkers.forEach(d => {
        if (d.urgency && !urgencyData[d.urgency]) {
          urgencyData[d.urgency] = 0;
        }
        urgencyData[d.urgency]++;
      });

      if (clusterMarkers.length > 1 && cluster.clusterIcon_.div_) {
        for (let i = 0; i < urgency.length; i++) {
          if (urgencyData.hasOwnProperty(urgency[i])) {
            const url = `${process.env.PUBLIC_URL}/icons/${urgency[i]}.png`;
            const image = cluster.clusterIcon_.div_.children[0];
            const divLabel = cluster.clusterIcon_.div_.children[1];
            image.src = url;
            image.style = "position: 56px; top: 0px; left: 0px; width: 56px";
            divLabel.style.width = '56px';
            divLabel.style.lineHeight = '56px';
            break;
          }
        }
      }
    })
  }

  // calculate the lines need to be drawn to shown connected markers
  const calculatePolylines = (currentMarkers) => {
    if (links && links.source && props[links.source].length) {

      const polylines = [];
      props[links.source].forEach(line => {

        let destMarker = null;
        let sourceMarker = null;

        if (line[links.destinationColumn] && line[links.sourceColumn]) {

          // check link source and destination id's in marker list to get marker's latlng

          if (!destMarker && currentMarkers.has(line[links.destinationColumn])) {
            destMarker = currentMarkers.get(line[links.destinationColumn])
          }

          if (!sourceMarker && currentMarkers.has(line[links.sourceColumn])) {
            sourceMarker = currentMarkers.get(line[links.sourceColumn])
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

  const renderPolylineIfNeeded = () => {
    return line.map((link, i) => {
      return <Polyline
        key={i}
        defaultVisible={true}
        options={{
          icons: [{
            icon: { path: 2 },
            offset: '45%',
          }],
          strokeColor: link.color,
          strokeOpacity: 1.0,
          strokeWeight: 1.5,
        }}
        path={[
          { lat: link.source.lat, lng: link.source.lng },
          { lat: link.destination.lat, lng: link.destination.lng },
        ]}
      />
    })
  }

  // handle response after searching
  const handleSearch = (data, isSuccess) => {
    if (isSuccess && !isEqual(stateData, data)) {
      clusterCenter = null;
      setSpiderfyMarkers([]);
      setSpiderifyLines([]);
      setLine([]);
      setStateData(data);
      onBoundsChanged();
    }
  }

  const renderSearchBarIfNeeded = () => {
    if (searchBar === false || !googleMapsAPIKey) {
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

  const onZoomChanged = () => {
    const zoom = googleMap.getZoom();

    if (zoom < maxZoom && spiderifyLines.length) {

      setSpiderfyMarkers([]);
      setSpiderifyLines([]);
      clusterZoom = null;
    }
  }

  let mapHeight = height;

  const currentCenter = {
    lat: Number(process.env.REACT_APP_MAP_LAT),
    lng: Number(process.env.REACT_APP_MAP_LNG),
  }

  const defaultLatLng = defaultCenter ? defaultCenter : currentCenter;

  if (searchBar !== false) {
    mapHeight -= 70;
  }

  return (
    <React.Fragment>
      {renderSearchBarIfNeeded()}
      {
        googleMapsAPIKey ?
          <GoogleMapsWrapper
            googleMapURL={googleMapURL}
            onBoundsChanged={onBoundsChanged}
            onZoomChanged={onZoomChanged}
            center={defaultLatLng}
            options={{
              maxZoom,
              minZoom,
              mapTypeControlOptions: {
                mapTypeIds: ['terrain']
              },
              streetViewControl: false,
              mapTypeControl: false,
              styles: mapStyles
            }}
            onMapMounted={onMapMounted}
            containerElement={<div style={{ height: mapHeight }} />}>
            {spiderifyLines}
            {spiderifyMarkers}
            <MarkerClusterer
              ignoreHidden={false}
              averageCenter
              gridSize={40}
              onClusteringEnd={handleClustererEnd}
              onClick={handleClusterClick}
            >
              {renderMarkersIfNeeded()}
              {renderPolylineIfNeeded()}
            </MarkerClusterer>
            {renderInfowindow()}
          </GoogleMapsWrapper>
          :
          (<WrongApikEey>
            Google Maps API Key has not been configured! Please configure the key through Nuage VSD Dashboard
                </WrongApikEey>)
      }
    </React.Fragment>
  )
}

GeoMap.propTypes = {
  data: PropTypes.array,
};

export default compose(
  WithValidationHOC(),
  (WithConfigHOC(config))
)(GeoMap);
