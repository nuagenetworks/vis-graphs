import React from 'react'
import AbstractGraph from '../AbstractGraph'
import { Marker, InfoWindow, Polyline } from 'react-google-maps'
import _ from 'lodash'
import MarkerClusterer from "react-google-maps/lib/components/addons/MarkerClusterer"

import GoogleMapsWrapper from '../../Map'
import SearchBar from "../../SearchBar"
import { getIconPath } from '../../utils/helpers'
import {properties} from './default.config'
import { theme } from '../../theme'

class GeoMap extends AbstractGraph {

  constructor(props) {

    super(props, properties)

    this.state = {
      data: [],
      infowindow: {
        data: null,
        position: null
      },
      lines: [],
      defaultCenter: null,
      spiderifyMarkers: [],
      spiderifyLines: []
    }

    this.markers       = new Map()
    this.center        = null
    this.map           = null
    this.clusterCenter = null
    this.timerId = null

    this.onMapMounted         = this.onMapMounted.bind(this)
    this.handleClusterClick   = this.handleClusterClick.bind(this)
    this.handleClustererEnd   = this.handleClustererEnd.bind(this)
    this.handleSearch         = this.handleSearch.bind(this)
    this.onBoundsChanged      = this.onBoundsChanged.bind(this)
    this.onZoomChanged        = this.onZoomChanged.bind(this)
  }

  componentWillMount() {
    this.initiate(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.data, nextProps.data))
      this.initiate(nextProps)
  }

  componentWillUnmount() {
    clearTimeout(this.timerId);
  }

  initiate(props) {

    this.clusterCenter = null
    this.markers       = new Map()

    this.setState({
      data: props.data,
      infowindow: {
        data: null,
        position: null
      },
      lines: [],
      defaultCenter: null,
      spiderifyMarkers: [],
      spiderifyLines: []
    })
  }

  onMapMounted(map) {
    if (!map)
      return

    this.map = map
  }

  onBoundsChanged() {
    const {
      latitudeColumn,
      longitudeColumn
    } = this.getConfiguredProperties()

    const bounds = new window.google.maps.LatLngBounds()

    this.state.data.forEach(marker => {
      if (marker[latitudeColumn] && marker[longitudeColumn]) {
        bounds.extend(new window.google.maps.LatLng(marker[latitudeColumn], marker[longitudeColumn]));
      }
    });

    let newCenter = bounds.getCenter().toJSON()

    if (newCenter && !_.isEqual(this.center, newCenter)) {
      this.center = newCenter
      this.setState({ defaultCenter: newCenter })
    }
  }

  // toggle info window on marker click
  toggleInfoWindow = (data = null, position = null) => {
    if(!data || !_.isEqual(position, this.state.infowindow.position)) {
      this.setState({
        infowindow: {
          data,
          position
        }
      })
    }
  }

  displayNSGInfo = (data) => {
      const {
          localityColumn,
          nameColumn,
          //Adding additional information
          criticalAlarmColumn,
          majorAlarmColumn,
          minorAlarmColumn,
          bootstrapStatusColumn,
          NSGVersionColumn,
      } = this.getConfiguredProperties();

      const rowStyle = {
          display: 'table-row'
      };
      const labelStyle = {
          fontSize: 9,
          color: 'rgb(106, 106, 106)',
          whiteSpace: 'nowrap',
          display: 'table-cell',
          marginRight: '10px'
      };

      const dataStyle = {
          whiteSpace: 'nowrap',
          display: 'table-cell',
          marginLeft: '10px'
      }

      const displayInfo = info => {
          return info.map( (row, i) => (
              <div key={i} style={rowStyle}>
                  <small style={labelStyle}>{row.label}</small>
                  <small style={dataStyle}>&nbsp;</small>
                  <small style={dataStyle}>{row.text}</small>
              </div>
          ))
      }
      return (
          <div style={{display: 'table'}}>
              {
                displayInfo([
                    {label: 'NSG', text: data[nameColumn]},
                    {label: 'Address', text: data[localityColumn]},
                    {label: 'Bootstrap Status', text: data[bootstrapStatusColumn] || 'No status found'},
                    {label: 'NSG Version', text: data[NSGVersionColumn] || 'No version found'},
                    {label: 'Critical Alarms', text: data[criticalAlarmColumn] || 'None'},
                    {label: 'Major Alarms', text: data[majorAlarmColumn] || 'None'},
                    {label: 'Minor Alarms', text: data[minorAlarmColumn] || 'None'}
                ])
              }
          </div>
      )
  }

  // popup info window on marker's click
  renderInfowindow() {
    let { data, position } = this.state.infowindow;

    return (
      data && (
        <InfoWindow
          position={position}
          options={{
            pixelOffset: new window.google.maps.Size(0,-25)
          }}
          onCloseClick={() => this.toggleInfoWindow}>
          { this.displayNSGInfo(data)}
        </InfoWindow>
      )
    )
  }

  // call on marker click
  handleMarkerClick(data) {
    const {
    onMarkClick
    } = this.props

    return onMarkClick ? onMarkClick(data) : ""
  }

  // draw markers on map
  renderMarkersIfNeeded() {
    const {
      latitudeColumn,
      longitudeColumn
    } = this.getConfiguredProperties()

    return this.state.data.filter(d => {
        return (d[latitudeColumn] && d[longitudeColumn]);
      }).map(d => {
          return this.drawMarker({
            data: {...d},
            position: {
              lat: d[latitudeColumn],
              lng: d[longitudeColumn]
            }
          })
      });
  }

  drawMarker({ data, position, labelOrigin = null}) {
    const {
      idColumn,
      markerIcon
    } = this.getConfiguredProperties()

    const iconData = getIconPath(markerIcon, data);
    return (
      <Marker
        noRedraw={false}
        options={{
          id: data[idColumn],
          data,
          urgency: iconData.urgency
        }}
        key={data[idColumn]}
        position={position}
        onClick={() => this.handleMarkerClick(data)}
        onMouseOver={() => this.toggleInfoWindow(data, position)}
        onMouseOut={() => this.toggleInfoWindow()}
        icon={{
          url: iconData.url,
          labelOrigin,
          anchor: labelOrigin
        }}
      />
    )
  }


  handleClusterClick(cluster) {
    const {
      maxZoom
    } = this.getConfiguredProperties()

    let zoom = this.map.getZoom()

    //Tracking Zoom of the Cluster, when it clicked and not at finalzoom,
    //Used to go back to that stage in case of Zoom out from MAX level
    if(zoom < maxZoom) {
      this.clusterZoom = this.map.getZoom()
    }

    let markers = cluster.getMarkers()
    if(zoom >= maxZoom  && markers.length > 1) {

      // check the cluster that is already expanded or not, if yes than collapse the clicked cluster
      if(this.clusterCenter && _.isEqual(this.clusterCenter.toJSON(), cluster.getCenter().toJSON())) {

        this.clusterCenter = null
        this.setState({
          spiderifyLines: [],
          spiderifyMarkers: []
        })

      } else {

        this.clusterCenter = cluster.getCenter()

        let projection = this.map.getProjection(),
        centerPoint = projection.fromLatLngToPoint(this.clusterCenter)

        let radius = 0.0002,
        step = markers.length < 10 ? markers.length : 10, counter = 0, remaining = markers.length,
        theta = ((Math.PI*2) / step)

        let spiderifyMarkers = markers.map((marker, i) => {
          counter++;

          let angle = (theta * counter),
          x =  (radius * Math.cos(angle)) + centerPoint.x,
          y = (radius * Math.sin(angle)) + centerPoint.y

          const point = projection.fromPointToLatLng(new window.google.maps.Point(x, y)).toJSON()

          if(counter === step) {
            remaining -= step;
            step += 5;
            if(remaining < step)
              step = remaining;

            counter = 0;
            radius += 0.00012;
            theta = ((Math.PI*2) / step)
          }

          return this.drawMarker({
            data: Object.assign({}, marker.data, {spiderify: true}),
            position: point,
            labelOrigin: new window.google.maps.Point(13, 13),
          })
        })

        const spiderifyLines = spiderifyMarkers.map( (marker, i) => {
          return (
            <Polyline
              key={i}
              defaultVisible={true}
              options={{
                strokeColor: theme.palette.orangeLightColor,
                strokeOpacity: 1.0,
                strokeWeight: 1.2
              }}
              path={[
                this.clusterCenter.toJSON(),
                marker.props.position
              ]}
            />
          )
        })

        this.setState({spiderifyMarkers, spiderifyLines})
      }
    }
  }

  handleClustererEnd(clusters) {
    clearTimeout(this.timerId);

    let markers = new Map()

    // get all markers from all clusters
    clusters.getClusters().forEach( cluster => {
      cluster.getMarkers().forEach( d => {
        markers.set(d.id, cluster.getCenter().toJSON())
      })
    })

    this.timerId = setTimeout(
      () => this.setClusterIcons(clusters),
      30
    );

    if (!_.isEqual(this.markers, markers)) {
      this.markers = markers
      this.calculatePolylines(markers)
    }
  }

  setClusterIcons(clusters) {
    const { urgency } = this.getConfiguredProperties();
    clusters.getClusters().forEach( cluster => {
      const clusterMarkers = cluster.getMarkers();
      const urgencyData = {};

      clusterMarkers.forEach(d => {
        if(d.urgency && !urgencyData[d.urgency]) {
          urgencyData[d.urgency] = 0;
        }
        urgencyData[d.urgency]++;
      });

      if (clusterMarkers.length > 1 && cluster.clusterIcon_.div_) {
        for (let i = 0; i < urgency.length; i++) {
          if(urgencyData.hasOwnProperty(urgency[i])) {
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
  calculatePolylines(markers) {
    const {
      latitudeColumn,
      longitudeColumn,
      idColumn,
      links
    } = this.getConfiguredProperties()

    if (links && links.source && this.props[links.source].length) {

      let polylines = [];

      this.props[links.source].forEach((line, i) => {

        let destMarker = null,
         sourceMarker = null


        if (line[links.destinationColumn] && line[links.sourceColumn]) {

          // check link source and destination id's in marker list to get marker's latlng

          if(!destMarker && markers.has(line[links.destinationColumn])) {
            destMarker = markers.get(line[links.destinationColumn])
          }

          if(!sourceMarker && markers.has(line[links.sourceColumn])) {
            sourceMarker = markers.get(line[links.sourceColumn])
          }

          // if any source or destintion point not found in bound, then find lat lng in data
          if (!destMarker && sourceMarker) {
            let destination = this.state.data.find(d => d[idColumn] === line[links.destinationColumn])

            if(destination) {
              destMarker = {
                lat: destination[latitudeColumn],
                lng: destination[longitudeColumn],
              }
            }
          }

          // if any source or destintion point not found in bound, then find lat lng in data
          if (!sourceMarker && destMarker) {
            let source = this.state.data.find(d => d[idColumn] === line[links.sourceColumn])
            if(source) {
              sourceMarker = {
                lat: source[latitudeColumn],
                lng: source[longitudeColumn],
              }
            }
          }

          if (destMarker && sourceMarker) {
            let color = line.color || theme.palette.redColor
            if (!this.isPolylineExist(polylines, sourceMarker, destMarker)) {
              polylines.push({
                'source': { lat: sourceMarker.lat, lng: sourceMarker.lng },
                'destination': { lat: destMarker.lat, lng: destMarker.lng },
                color
              })
            }
          }
        }

      })
      this.setState({ lines: polylines })
    }
  }

  // check line is already drawn or not
  isPolylineExist(polylines, sourceMarker, destMarker) {
    return polylines.some(function (el) {
      return ((el.source.lat === sourceMarker.lat && el.source.lng === sourceMarker.lng) && (el.destination.lat === destMarker.lat && el.destination.lng === destMarker.lng));
    });
  }

  renderPolylineIfNeeded() {

    return this.state.lines.map( (link, i) => {
      return <Polyline
        key={i}
        defaultVisible={true}
        options={{
          icons: [{
            icon: { path: 2 },
            offset: '45%'
          }],
          strokeColor: link.color,
          strokeOpacity: 1.0,
          strokeWeight: 1.5
        }}
        path={[
          { lat: link.source.lat, lng: link.source.lng },
          { lat: link.destination.lat, lng: link.destination.lng }
        ]}
      />
    })
  }

  // handle response after searching
  handleSearch(data, isSuccess) {
    if(isSuccess && !_.isEqual(this.state.data, data)) {
      this.clusterCenter = null
      this.setState({
        spiderifyLines: [],
        spiderifyMarkers: [],
        lines: [],
        data
      })
    }
  }

  renderSearchBarIfNeeded() {
    const {
        searchBar,
        filters
    } = this.getConfiguredProperties()

    if(searchBar === false)
       return

    return (
      <SearchBar
        data={this.props.data}
        options={filters}
        handleSearch={this.handleSearch}
      />
    );
  }

  onZoomChanged() {
    const {
      maxZoom
    } = this.getConfiguredProperties()

    let zoom = this.map.getZoom()

    if(zoom < maxZoom  && this.state.spiderifyLines.length) {
      this.setState({
        spiderifyLines: [],
        spiderifyMarkers: []
      })

      //IN Case of Zoomout going back to initial zoom when cluster has been clicked
      if(this.clusterZoom) {
        //this.map.setZoom(this.clusterZoom)
      }

      this.clusterZoom = null;
    }
  }

  render() {
    const {
      data,
      height,
      googleMapURL,
      googleMapsAPIKey
    } = this.props

    const {
        searchBar,
        maxZoom,
        minZoom,
        mapStyles
    } = this.getConfiguredProperties()

    if (!data || !data.length)
      return this.renderMessage('No data to visualize')


    let mapHeight = height,
        defaultCenter = {
          lat: Number(process.env.REACT_APP_GOOGLE_MAP_LAT),
          lng: Number(process.env.REACT_APP_GOOGLE_MAP_LNG)
        }

    const defaultLatLng = this.state.defaultCenter ? this.state.defaultCenter : defaultCenter;

    if(searchBar !== false) {
      mapHeight -= 69
    }

    return (
      <div>
        {this.renderSearchBarIfNeeded()}
        {
            googleMapsAPIKey ?
                <GoogleMapsWrapper
                    googleMapURL={googleMapURL}
                    onBoundsChanged={this.onBoundsChanged}
                    onZoomChanged={this.onZoomChanged}
                    center={defaultLatLng}
                    options={{
                        maxZoom,
                        minZoom,
                        mapTypeControlOptions: {
                            mapTypeIds: ['terrain']
                        },
                        streetViewControl:false,
                        mapTypeControl: false,
                        styles: mapStyles
                    }}
                    onMapMounted={this.onMapMounted}
                    containerElement={<div style={{ height: mapHeight }} />}>
                    { this.state.spiderifyLines }
                    { this.state.spiderifyMarkers }
                    <MarkerClusterer
                        ignoreHidden={false}
                        averageCenter
                        gridSize={60}
                        onClusteringEnd={ this.handleClustererEnd}
                        onClick={ this.handleClusterClick }
                    >
                        { this.renderMarkersIfNeeded() }
                        { this.renderPolylineIfNeeded() }
                    </MarkerClusterer>
                    { this.renderInfowindow() }
                </GoogleMapsWrapper>
                :
                <div style={{position: 'absolute', top: '50%', left: '30%', fontSize: '14px'}}>
                    Google Maps API Key has not been configured! Please configure the key through Nuage VSD Dashboard
                </div>
        }

      </div>
    )
  }
}

GeoMap.propTypes = {
  data: React.PropTypes.array
};

export default GeoMap;