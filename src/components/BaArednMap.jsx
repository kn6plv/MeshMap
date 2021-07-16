// @flow

import React, { Component } from "react";
import { Map, TileLayer, Marker, Popup } from "react-leaflet";
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
      const mapCenter = [this.props.appConfig.mapSettings.mapCenter.lat, this.props.appConfig.mapSettings.mapCenter.lon];
      return (
        <Map ref="map" className="Map" center={mapCenter} zoom={this.props.appConfig.mapSettings.zoom} scrollWheelZoom={false}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
            { this.props.nodesData.map(n =>
              <Marker ref={n.node} key={n.node} position={[n.lat,n.lon]} icon={ getIcon(n.meshrf.freq) }>
                <Popup> {
                  <div><h6><a href={`http://${n.node}.local.mesh`} target="_blank">{n.node}</a></h6>
                    <table>
                      <tr style={{verticalAlign:"top"}}><td>Desc</td><td>{n.node_details.description}</td></tr>
                      <tr><td>Position</td><td>{n.lat},{n.lon}</td></tr>
                      <tr><td>RF Status</td><td>{n.meshrf.status}</td></tr>
                      <tr><td>SSID</td><td>{n.meshrf.ssid}</td></tr>
                      <tr><td>RF Channel</td><td>{n.meshrf.channel}</td></tr>
                      <tr><td>RF Freq</td><td>{n.meshrf.freq}</td></tr>
                      <tr><td>MAC</td><td>{n.interfaces[0].mac}</td></tr>
                      <tr style={{verticalAlign:"top"}}><td>Model</td><td>{n.node_details.model}</td></tr>
                      <tr><td width="80">Firmware</td><td>{n.node_details.firmware_version}</td></tr>
                      <tr style={{verticalAlign:"top",whiteSpace:"nowrap"}}><td>Neighbors</td><td> {
                        n.link_info.map(m => <div key={m.hostname}><a href="#" onClick={()=>this.openPopup(m.hostname.replace(/\.local\.mesh$/,''))}>{m.hostname.replace(/\.local\.mesh$/,'')}</a> { m.linkType ? `(${m.linkType})` : "" } </div>)
                      } </td></tr>
                    </table>
                  </div>
                }
              </Popup>
            </Marker>)}
        </Map>
      );
    }
  }

  openPopup(id) {
    const popup = this.refs[id];
    if (popup) {
      popup.fireLeafletEvent('click');
    }
  }
}

export default BaArednMap;
