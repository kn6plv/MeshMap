// @flow

import React, { Component } from "react";
import { Map, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { Icon } from "leaflet";

const PurpleIcon = new Icon({
  iconUrl: "./purpleRadioCircle-icon.png",
  iconSize: [25, 25],
})

const OrangeIcon = new Icon({
  iconUrl: "./goldRadioCircle-icon.png",
  iconSize: [25, 25],
})

const BlueIcon = new Icon({
  iconUrl: "./blueRadioCircle-icon.png",
  iconSize: [25, 25],
})

const MagentaIcon = new Icon({
  iconUrl: "./magentaRadioCircle-icon.png",
  iconSize: [25, 25],
})

const GrayIcon = new Icon({
  iconUrl: "./grayRadioCircle-icon.png",
  iconSize: [25, 25],
})

// Function to get the Freq Icon
function getIcon(freq){
  if(freq !== null && typeof freq !== 'undefined' )
  {
    if(freq.includes("2.")) {
      return PurpleIcon;
    }
    else if(freq.includes("5.")){
      return OrangeIcon;
    }
    else if(freq.includes("3.")){
      return BlueIcon;
    }
    else if (freq.includes("900")){
      return MagentaIcon;
    }
  }
  return GrayIcon;
}

class BaArednMap extends Component {

  state = {
      //appConfig: this.props.appConfig,
      zoom: 9.5,
      mapCenter: {
        lat: 18.2,
        lon: -66.3,
      }
  }

  componentDidMount() {
    //this.setState({appConfig: this.props.appConfig})
    //console.log(this.state,"ACTUAL STATE")
  }

  render() {
    //console.log(this.props.appConfig,"appConfig")
    if(this.props.appConfig.length === 0) {
      return null;
    }
    else {
      //const mapCenter = [this.state.mapCenter.lat, this.state.mapCenter.lon];
      const rfconns = [];
      const tunconns = [];
      const nodes = {};
      const done = {};
      this.props.nodesData.forEach(n => nodes[this.canonicalHostname(n.node)] = n);
      this.props.nodesData.forEach(n => {
        if (!n.lat || !n.lon) {
          return;
        }
        const fn = this.canonicalHostname(n.node);
        n.link_info.forEach(m => {
          const tn = this.canonicalHostname(m.hostname);
          const to = nodes[tn];
          if (to) {
            if (!to.lat || !to.lon || done[`${tn}/${fn}`]) {
              return;
            }
            const conn = [ [ n.lat, n.lon ], [ to.lat, to.lon ] ];
            switch (m.linkType) {
              case 'RF':
                rfconns.push(conn);
                break;
              case 'TUN':
                tunconns.push(conn);
                break;
              case 'DTD':
              default:
                break;
            }
            done[`${tn}/${fn}`] = true;
            done[`${fn}/${tn}`] = true;
          }
        });
      });
      const mapCenter = [this.props.appConfig.mapSettings.mapCenter.lat, this.props.appConfig.mapSettings.mapCenter.lon];
      return (
        <Map ref="map" className="Map" center={mapCenter} zoom={this.props.appConfig.mapSettings.zoom} scrollWheelZoom={false}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            //url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            url="http://kn6plv-tiles.local.mesh/tile/{z}/{x}/{y}.png"
          />
          <Polyline color="lime" weight="2" positions={rfconns} />
          <Polyline color="grey" weight="1" dashArray="5 5" positions={tunconns} />
          { this.props.nodesData.map(n =>
            <Marker ref={n.node.toUpperCase()} key={n.node} position={[n.lat,n.lon]} icon={ getIcon(n.meshrf.freq) }>
              <Popup> {
                <div><h6><a href={`http://${n.node}.local.mesh`} target="_blank">{n.node}</a></h6>
                  <table>
                    <tr style={{verticalAlign:"top"}}><td>Desc</td><td>{n.node_details.description}</td></tr>
                    <tr><td>Location</td><td>{n.lat},{n.lon}</td></tr>
                    <tr><td>RF Status</td><td>{n.meshrf.status}</td></tr>
                    { n.meshrf.status === 'on' && <tbody>
                        <tr><td>SSID</td><td>{n.meshrf.ssid}</td></tr>
                        <tr><td>RF Channel</td><td>{n.meshrf.channel}</td></tr>
                        <tr><td>RF Freq</td><td>{n.meshrf.freq}</td></tr>
                        <tr><td>Bandwidth</td><td>{n.meshrf.chanbw} MHz</td></tr>
                        <tr><td>MAC</td><td>{n.interfaces[0].mac}</td></tr>
                        </tbody>
                    }
                    <tr style={{verticalAlign:"top"}}><td>Model</td><td>{n.node_details.model}</td></tr>
                    <tr><td width="80">Firmware</td><td>{n.node_details.firmware_version}</td></tr>
                    <tr style={{verticalAlign:"top",whiteSpace:"nowrap"}}><td>Neighbors</td><td> {
                      n.link_info.map(m => <div key={m.hostname}><a href="#" onClick={()=>this.openPopup(m.hostname)}>{this.canonicalHostname(m.hostname)}</a> { m.linkType ? `(${m.linkType})` : "" } </div>)
                    } </td></tr>
                  </table>
                </div>
              } </Popup>
            </Marker>)
          }
        </Map>
      );
    }
  }

  openPopup(id) {
    const popup = this.refs[this.canonicalHostname(id)];
    if (popup) {
      popup.fireLeafletEvent('click');
    }
  }

  canonicalHostname(hostname) {
    return hostname.replace(/^\./, '').replace(/\.local\.mesh$/i,'').toUpperCase()
  }
}

export default BaArednMap;
