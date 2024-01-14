// @flow

import React, { Component } from "react";
import { Map, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { Icon } from "leaflet";
import axios from "axios";
import hardware from "../hardware";
import AzimuthPointer from "./AzimuthPointer";
const Turf = require('@turf/turf');

const PurpleIcon = new Icon({
  iconUrl: "./mesh_icon_75px_purple.png",
  iconSize: [25, 25],
})

const OrangeIcon = new Icon({
  iconUrl: "./mesh_icon_75px_gold.png",
  iconSize: [25, 25],
})

const BlueIcon = new Icon({
  iconUrl: "./mesh_icon_75px_blue.png",
  iconSize: [25, 25],
})

const MagentaIcon = new Icon({
  iconUrl: "./mesh_icon_75px_purple.png",
  iconSize: [25, 25],
})

const GrayIcon = new Icon({
  iconUrl: "./mesh_icon_75px_gray.png",
  iconSize: [25, 25],
})

const GreenIcon = new Icon({
  iconUrl: "./mesh_icon_75px_green.png",
  iconSize: [25, 25],
})

// Function to get the Freq Icon
function getIcon(n){
  if (n.node_details.mesh_supernode) {
    return GreenIcon;
  }
  const rf = n.meshrf;
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
            if (tile.test) {
              return await new Promise(resolve => {
                const img = document.createElement("img");
                img.onload = () => resolve(tile.url);
                img.onerror = () => resolve(null);
                img.src = tile.test;
                setTimeout(() => {
                  if (!img.complete) {
                    resolve(null);
                  }
                }, 1000);
              });
            }
            else {
              return tile.url;
            }
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
    const stunconns = [];
    const dtdconns = [];
    const rfdtdconns = [];
    const nodes = {};
    const validnodes = {};
    const done = {};
    this.props.nodesData.forEach(n => nodes[this.canonicalHostname(n.node)] = n);
    this.props.nodesData.forEach(n => {
      if (!(n.mlat && n.mlon)) {
        return;
      }
      const icon = getIcon(n);
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
        case 'supernode':
          if (icon !== GreenIcon) {
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
              const dfrom = Turf.point([ n.lon, n.lat ]);
              const dto = Turf.point([ to.lon, to.lat ]);
              if (Turf.distance(dfrom, dto, { units: "meters" }) < 50) {
                dtdconns.push(conn);
              }
              else {
                rfdtdconns.push(conn);
              }
              break;
            case 'XLINK':
              rfdtdconns.push(conn);
              break;
            case 'SUPER':
              stunconns.push(conn);
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
    const mhref = (n) => {
      return this.props.appConfig.active === false ? <a>{n.node}</a> : <a href={`http://${n.node}.local.mesh`} target="_blank">{n.node}</a>
    }
    const todayStart = new Date().setHours(0, 0, 0, 0) / 1000;
    const yesterdayStart = todayStart - 24 * 60 * 60;
    const weekStart = todayStart - 7 * 24 * 60 * 60;
    const mapCenter = [this.props.appConfig.mapSettings.mapCenter.lat, this.props.appConfig.mapSettings.mapCenter.lon];
    return (
      <Map ref="map" className="Map" center={mapCenter} zoom={this.props.appConfig.mapSettings.zoom} scrollWheelZoom={true}>
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url={this.state.tile_url}
        />
        {
          rfconns.map(conn =>
            <Polyline color="limegreen" weight="2" positions={conn.pos}>
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
          stunconns.map(conn =>
            <Polyline color="blue" weight="2" dashArray="5 5" positions={conn.pos}>
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
          rfdtdconns.map(conn =>
            <Polyline color="limegreen" weight="3" dashArray="2 6" positions={conn.pos}>
              <Popup maxWidth="500">
                <a href="#" onClick={()=>this.openPopup(conn.from)}>{conn.from}</a> &harr; <a href="#" onClick={()=>this.openPopup(conn.to)}>{conn.to}</a>
              </Popup>
            </Polyline>
          )
        }
        { 
          Object.values(validnodes).map(n =>
            <div>
              <AzimuthPointer azimuth={n.meshrf.azimuth} lat={n.mlat} lon={n.mlon} />  
              <Marker ref={n.node.toUpperCase()} key={n.node} position={[n.mlat,n.mlon]} icon={ getIcon(n) }>
                <Popup minWidth="240" maxWidth="380"> {
                  <div><h6>{mhref(n)}</h6>
                    <table>
                      <tr style={{verticalAlign:"top"}}><td>Description</td><td>{n.node_details.description}</td></tr>
                      <tr><td>Location</td><td>{n.lat},{n.lon}</td></tr>
                      {!isNaN(n.meshrf.height) && 
                        <tr><td>Height</td><td>{n.meshrf.height}</td></tr>
                      }
                      {!isNaN(n.meshrf.azimuth) &&
                        <tr><td>Azimuth</td><td>{n.meshrf.azimuth}&deg;</td></tr>
                      }
                      {!isNaN(n.meshrf.elevation) &&
                        <tr><td>Elevation</td><td>{n.meshrf.elevation}&deg;</td></tr>
                      }
                      <tr><td>Last seen</td><td>
                      {
                        n.lastseen > todayStart ? "Today" :
                        n.lastseen > yesterdayStart ? "Yesterday" :
                        n.lastseen > weekStart ? "The last 7 days" : "A long time ago..."
                      }
                      </td></tr>
                      <tr><td>RF Status</td><td style={{textTransform: "capitalize"}}>{n.meshrf.status}</td></tr>
                      { n.meshrf.status === 'on' && <tbody>
                          <tr><td>SSID</td><td>{n.meshrf.ssid}</td></tr>
                          <tr style={{verticalAlign:"top"}}><td>Channel</td><td>{n.meshrf.channel}</td></tr>
                          <tr><td>Frequency</td><td>{n.meshrf.freq}</td></tr>
                          <tr><td>Bandwidth</td><td>{n.meshrf.chanbw} MHz</td></tr>
                          <tr><td>LQM</td><td>{n.lqm && n.lqm.enabled ? 'Enabled' : n.lqm ? 'Disabled' : 'Unavailable'}</td></tr>
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
                            if (n.lat && n.lon && hn.lat && hn.lon) {
                              if (m.linkType === "RF") {
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
                              else if (m.linkType == "XLINK") {
                                const from = Turf.point([ n.lon, n.lat ]);
                                const to = Turf.point([ hn.lon, hn.lat ]);
                                const bearing = (360 + Math.round(Turf.bearing(from, to, { units: "degrees" }))) % 360;
                                const distance = Turf.distance(from, to, { units: "miles" }).toFixed(1);
                                if (parseFloat(distance) > 0) {
                                  info = `${bearing}\u00B0 ${distance} miles`;
                                }
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
            </div>
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
