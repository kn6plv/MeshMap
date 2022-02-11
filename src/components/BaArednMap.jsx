// @flow

import React, { Component } from "react";
import { Map, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { Icon } from "leaflet";
import axios from "axios";
import hardware from "../hardware";
const Turf = require('@turf/turf');

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
    tile_url: null
  }

  render() {
    if(!this.props.appConfig) {
      return null;
    }

    if (!this.state.tile_url) {
      new Promise(async () => {
        const url = (await Promise.all(this.props.appConfig.mapSettings.servers.map(async tile => {
          try {
            await axios.head(tile.test, { timeout: 1000 });
            return tile.url;
          }
          catch (e) {
            return null;
          }
        }))).find(item => item);
        this.setState({ tile_url: url });
      });
      return null;
    }

    const rfconns = [];
    const tunconns = [];
    const dtdconns = [];
    const nodes = {};
    const validnodes = {};
    const done = {};
    this.props.nodesData.forEach(n => nodes[this.canonicalHostname(n.node)] = n);
    this.props.nodesData.forEach(n => {
      if (!n.lat || !n.lon) {
        return;
      }
      const icon = getIcon(n.meshrf);
      switch (this.props.selected) {
        case '900':
          if (icon !== MagentaIcon) {
            return;
          }
          break;
        case '24':
          if (icon !== PurpleIcon) {
            return;
          }
          break;
        case '34':
          if (icon !== BlueIcon) {
            return;
          }
          break;
        case '58':
          if (icon !== OrangeIcon) {
            return;
          }
          break;
        case 'off':
          if (icon !== GrayIcon) {
            return;
          }
          break;
        case 'all':
          break;
        default:
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
              dtdconns.push(conn);
              break;
            default:
              break;
          }
          done[`${tn}/${fn}`] = true;
          done[`${fn}/${tn}`] = true;
        }
      });
      validnodes[fn] = n;
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
        {
          dtdconns.map(conn =>
            <Polyline color="cadetblue" weight="2" dashArray="1 10" positions={conn.pos}>
              <Popup maxWidth="500">
                <a href="#" onClick={()=>this.openPopup(conn.from)}>{conn.from}</a> &harr; <a href="#" onClick={()=>this.openPopup(conn.to)}>{conn.to}</a>
              </Popup>
            </Polyline>
          )
        }
        { 
          Object.values(validnodes).map(n =>
            <Marker ref={n.node.toUpperCase()} key={n.node} position={[n.lat,n.lon]} icon={ getIcon(n.meshrf) }>
              <Popup minWidth="240" maxWidth="380"> {
                <div><h6><a href={`http://${n.node}.local.mesh`} target="_blank">{n.node}</a></h6>
                  <table>
                    <tr style={{verticalAlign:"top"}}><td>Description</td><td>{n.node_details.description}</td></tr>
                    <tr><td>Location</td><td>{n.lat},{n.lon}</td></tr>
                    <tr><td>RF Status</td><td style={{textTransform: "capitalize"}}>{n.meshrf.status}</td></tr>
                    { n.meshrf.status === 'on' && <tbody>
                        <tr><td>SSID</td><td>{n.meshrf.ssid}</td></tr>
                        <tr style={{verticalAlign:"top"}}><td>Channel</td><td>{n.meshrf.channel}</td></tr>
                        <tr><td>Frequency</td><td>{n.meshrf.freq}</td></tr>
                        <tr><td>Bandwidth</td><td>{n.meshrf.chanbw} MHz</td></tr>
                        <tr><td>MAC</td><td>{n.interfaces[0].mac}</td></tr>
                        </tbody>
                    }
                    <tr style={{verticalAlign:"top"}}><td>Hardware</td><td>{hardware(n.node_details.board_id) || n.node_details.model}</td></tr>
                    <tr><td width="80">Firmware</td><td>{n.node_details.firmware_version}</td></tr>
                    <tr style={{verticalAlign:"top",whiteSpace:"nowrap"}}><td>Neighbors</td><td> {
                      n.link_info.map(m => {
                        const cname = this.canonicalHostname(n.node);
                        const chostname = this.canonicalHostname(m.hostname);
                        const hn = nodes[chostname];
                        if (hn && m.linkType) {
                          let info = "";
                          if (n.lat && n.lon && hn.lat && hn.lon && m.linkType === "RF") {
                            const from = Turf.point([ n.lon, n.lat ]);
                            const to = Turf.point([ hn.lon, hn.lat ]);
                            const bearing = (360 + Math.round(Turf.bearing(from, to, { units: "degrees" }))) % 360;
                            const distance = Turf.distance(from, to, { units: "miles" }).toFixed(1);
                            if (parseFloat(distance) > 0) {
                              let sigf = m.signal - m.noise;
                              if (isNaN(sigf)) {
                                sigf = '-';
                              }
                              const hl = hn.link_info.find(info => this.canonicalHostname(info.hostname) === cname);
                              let sigt = hl ? hl.signal - hl.noise : '-';
                              if (isNaN(sigt)) {
                                sigt = '-';
                              }
                              info = `${sigf} dB \u2190 ${bearing}\u00B0 ${distance} miles \u2192 ${sigt} dB`;
                            }
                          }
                          return <div>
                            <div key={m.hostname}><a href="#" onClick={()=>this.openPopup(m.hostname)}>{chostname}</a> <span className="linktype">{m.linkType}</span></div>
                            <div className="bearing">{info}</div>
                          </div>
                        }
                        else {
                          return <div key={m.hostname}>{this.canonicalHostname(m.hostname)} <span className="linktype">{ m.linkType ? `${m.linkType}` : "" }</span></div>
                        }
                      })
                    } </td></tr>
                  </table>
                </div>
              } </Popup>
            </Marker>
          )
        }
      </Map>
    );
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
