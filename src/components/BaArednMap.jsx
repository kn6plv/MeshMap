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
      return PurpleIcon
    }
    else if(freq.includes("5.")){
      return OrangeIcon 
    }
    else if(freq.includes("3.")){
      return BlueIcon
    }
    else if (freq.includes("900")){
      return MagentaIcon
    }
  }
  return GrayIcon
  
}

class BaArednMap extends Component {


state = {
      //appConfig: this.props.appConfig,
      zoom: 9.5,
      mapCenter: {
        lat: 18.2,
        lon: -66.3,
      },
      
  }

  componentDidMount() {
    //this.setState({appConfig: this.props.appConfig})
    //console.log(this.state,"ACTUAL STATE")

    }

  render() {
    //console.log(this.props.appConfig,"appConfig")
    if(this.props.appConfig.length === 0) { return null }
    else {
    //const mapCenter = [this.state.mapCenter.lat, this.state.mapCenter.lon];
    const mapCenter = [this.props.appConfig.mapSettings.mapCenter.lat, this.props.appConfig.mapSettings.mapCenter.lon];
    return (
      <Map className="Map" center={mapCenter} zoom={this.props.appConfig.mapSettings.zoom} scrollWheelZoom={false}>
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
          { this.props.nodesData.map(n => <Marker key={n.node} position={[n.lat,n.lon]} icon={ getIcon(n.meshrf.freq) }>
            <Popup>  
              {<div><h6>{n.node}</h6>
              <p><a href={`http://${n.node}.local.mesh`} target="_blank">View Node Console</a><br/>
                 Desc: {n.node_details.description} <br/>
                 Position: ({n.lat},{n.lon})<br/>
                 RF Status: {n.meshrf.status}<br/>
                 SSID: {n.meshrf.ssid} <br/>
                 RF Channel: {n.meshrf.channel}<br/>
                 RF Freq: {n.meshrf.freq}<br/>
                 MAC: {n.interfaces[0].mac}<br/>
                 Model: {n.node_details.model}<br/>
                 Firmware Ver: {n.node_details.firmware_version} <br/> </p>            
                 Neighbors:<br/><ul> { n.link_info.map(m => <li key={m.hostname}> {m.hostname} ({m.linkType}) </li>)} </ul> </div>
                }      
            </Popup>
          </Marker>)}
          
      </Map>
    );
  }
}
}

export default BaArednMap;
