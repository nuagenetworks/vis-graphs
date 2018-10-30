import PropTypes from 'prop-types';
import React from 'react';
import { GoogleMap,withGoogleMap,withScriptjs } from 'react-google-maps';

const GoogleMapsWrapper = withScriptjs(withGoogleMap(props => {
  return (
    <GoogleMap
      {...props}
      ref={props.onMapMounted}
    >
      {props.children}
    </GoogleMap>
  )
}));

GoogleMapsWrapper.defaultProps = {
  options: {
    streetViewControl:false,
    maxZoom: 18,
    minZoom: 2
  },
  containerElement: <div style={{ height: '380px' }} />,
  loadingElement: <div style={{ height: `100%` }} />,
  mapElement: <div style={{ height: `100%` }} />,
  googleMapURL: `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAP_API}&v=3.exp&libraries=${process.env.REACT_APP_GOOGLE_MAP_LIBRARIES}`,
  defaultZoom: Number(process.env.REACT_APP_GOOGLE_MAP_ZOOM),
  defaultCenter: { lat: Number(process.env.REACT_APP_GOOGLE_MAP_LAT), lng: Number(process.env.REACT_APP_GOOGLE_MAP_LNG) }
}

GoogleMapsWrapper.propTypes = {
  defaultZoom: PropTypes.number.isRequired,
  googleMapURL: PropTypes.string.isRequired,
  defaultCenter: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired
  })
}

export default GoogleMapsWrapper
