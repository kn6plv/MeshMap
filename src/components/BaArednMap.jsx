// @flow

import React, { Component } from "react";
import { Map, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { Icon } from "leaflet";
import axios from "axios"

const TILE_URLS = [
  { test: "http://kn6plv-tiles.local.mesh/tile/10/164/395.png", url: "http://kn6plv-tiles.local.mesh/tile/{z}/{x}/{y}.png" },
  { test: "https://c.tile.openstreetmap.org/10/162/395.png", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }
];

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
function getIcon(rf){
  const chan = parseInt(rf.channel);
  if (chan >= 3380 && chan <= 3495) {
    return BlueIcon;
  }
  const freq = rf.freq;
  if (freq) {
    if(freq.indexOf("2") === 0) {
      return PurpleIcon;
    }
    else if(freq.indexOf("5") === 0){
      return OrangeIcon;
    }
    else if(freq.indexOf("3") === 0){
      return BlueIcon;
    }
    else if (freq.indexOf("900") === 0){
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
      },
      tile_url: null
  }

  async componentDidMount() {
    const url = (await Promise.all(TILE_URLS.map(async tile => {
      try {
        await axios.head(tile.test, { timeout: 1000 });
        return tile.url;
      }
      catch (e) {
        return null;
      }
    }))).find(item => item);
    this.setState({ tile_url: url });
  }

  render() {
    if(this.props.appConfig.length === 0 || !this.state.tile_url) {
      return null;
    }
    else {
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
            const conn = { pos: [[ n.lat, n.lon ], [ to.lat, to.lon ]], from: fn, to: tn };
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
            url={this.state.tile_url}
          />
          {
            rfconns.map(conn =>
              <Polyline color="lime" weight="2" positions={conn.pos}>
                <Popup maxWidth="500">
                  <a href="#" onClick={()=>this.openPopup(conn.from)}>{conn.from}</a> &harr; <a href="#" onClick={()=>this.openPopup(conn.to)}>{conn.to}</a>
                </Popup>
              </Polyline>
            )
          }
          {
            tunconns.map(conn =>
              <Polyline color="grey" weight="2" dashArray="5 5" positions={conn.pos}>
                <Popup maxWidth="500">
                  <a href="#" onClick={()=>this.openPopup(conn.from)}>{conn.from}</a> &harr; <a href="#" onClick={()=>this.openPopup(conn.to)}>{conn.to}</a>
                </Popup>
              </Polyline>
            )
          }
          { this.props.nodesData.map(n =>
            <Marker ref={n.node.toUpperCase()} key={n.node} position={[n.lat,n.lon]} icon={ getIcon(n.meshrf) }>
              <Popup maxWidth="350"> {
                <div><h6><a href={`http://${n.node}.local.mesh`} target="_blank">{n.node}</a></h6>
                  <table>
                    <tr style={{verticalAlign:"top"}}><td>Desc</td><td>{n.node_details.description}</td></tr>
                    <tr><td>Location</td><td>{n.lat},{n.lon}</td></tr>
                    <tr><td>RF Status</td><td>{n.meshrf.status}</td></tr>
                    { n.meshrf.status === 'on' && <tbody>
                        <tr><td>SSID</td><td>{n.meshrf.ssid}</td></tr>
                        <tr style={{verticalAlign:"top"}}><td>RF Channel</td><td>{n.meshrf.channel}</td></tr>
                        <tr><td>RF Freq</td><td>{n.meshrf.freq}</td></tr>
                        <tr><td>Bandwidth</td><td>{n.meshrf.chanbw} MHz</td></tr>
                        <tr><td>MAC</td><td>{n.interfaces[0].mac}</td></tr>
                        </tbody>
                    }
                    <tr style={{verticalAlign:"top"}}><td>Model</td><td>{n.node_details.model}</td></tr>
                    <tr><td width="80">Firmware</td><td>{n.node_details.firmware_version}</td></tr>
                    <tr style={{verticalAlign:"top",whiteSpace:"nowrap"}}><td>Neighbors</td><td> {
                      n.link_info.map(m => {
                        if (nodes[this.canonicalHostname(m.hostname)]) {
                          return <div key={m.hostname}><a href="#" onClick={()=>this.openPopup(m.hostname)}>{this.canonicalHostname(m.hostname)}</a> { m.linkType ? `(${m.linkType})` : "" } </div>
                        }
                        else {
                          return <div key={m.hostname}>{this.canonicalHostname(m.hostname)} { m.linkType ? `(${m.linkType})` : "" } </div>
                        }
                      })
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
