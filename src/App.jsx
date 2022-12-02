// @flow

import "leaflet/dist/leaflet.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import React, { Component } from "react";
import BaArednMap from "./components/BaArednMap"
import sysinfo from "./APIResources.json"
import axios from "axios"
import alertify from 'alertifyjs'
import "alertifyjs/build/css/themes/default.min.css"
import "alertifyjs/build/css/alertify.min.css"
import Header from './components/Header'

class App extends Component {

  state = {
    appConfig: null,
    nodesData: [],
    lastUpdated: null,
    selected: 'all'
  }

  // Get the details from the node. Recieves the name of the node.
  async retrieveNodeDetails(node)
  {
    try {
      const nodeInfo = await axios.get(`http://${node.name}.local.mesh:8080${sysinfo.resource}?${sysinfo.params.link_info}&${sysinfo.params.lqm}`)
      if (nodeInfo.status === 200 && nodeInfo.data.lat && nodeInfo.data.lon) {
        const node = {
          node: nodeInfo.data.node,
          lat: nodeInfo.data.lat,
          lon: nodeInfo.data.lon,
          mlat: nodeInfo.data.lat,
          mlon: nodeInfo.data.lon,
          meshrf : nodeInfo.data.meshrf,
          chanbw: nodeInfo.data.chanbw,
          node_details: nodeInfo.data.node_details,
          interfaces: nodeInfo.data.interfaces,
          link_info: Object.keys(nodeInfo.data.link_info || {}).map((key) => nodeInfo.data.link_info[key]),
          lqm: nodeInfo.data.lqm
        };

        //  Add this node to the state
        this.setState({ nodesData: [ ...this.state.nodesData, node ] });
      }
    }
    catch(_) {
    }
  }

  async getNodesData() {
    if (!this.state.appConfig.offline) {
      try {
        // Get the list of nodes / hosts before to retrieve the nodes information.
        const start = this.state.appConfig.mapSettings.mapCenter.node || "localnode";
        const nodes =  await axios.get(`http://${start}.local.mesh:8080${sysinfo.resource}${sysinfo.params.hosts}`)
        // Get only the ones that matches the format CALLSIGN-CITY-COUNTRY-TYPE#NODENUMBER
        const regex = new RegExp(this.state.appConfig.nodesFilter);
        const filteredNodeList = nodes.data.hosts.filter(h => h.name.toUpperCase().trim().match(regex))
        // Iterate thru each node to get the details.
        Object.keys(filteredNodeList).forEach(key => this.retrieveNodeDetails(filteredNodeList[key]));
        return;
      }
      catch(e) {
      }
    }
    try {
      await this.getStoredNodesData()
    }
    catch (e) {
      alertify.alert("Unable to find your AREDN node, please verify if you are connected to the MESH.");
    }
  }

  async getStoredNodesData() {
    try {
      const stored = await axios.get('data/out.json');
      const nodesData = [];
      stored.data.nodeInfo.forEach(nodeInfo => {
        if ((nodeInfo.data.lat && nodeInfo.data.lon) || (nodeInfo.data.mlat && nodeInfo.data.mlon)) {
          nodesData.push({
            node: nodeInfo.data.node,
            lat: nodeInfo.data.lat || nodeInfo.data.mlat,
            lon: nodeInfo.data.lon || nodeInfo.data.mlon,
            mlat: nodeInfo.data.mlat || nodeInfo.data.lat,
            mlon: nodeInfo.data.mlon || nodeInfo.data.lon,
            meshrf : nodeInfo.data.meshrf,
            chanbw: nodeInfo.data.chanbw,
            node_details: nodeInfo.data.node_details,
            interfaces: nodeInfo.data.interfaces,
            link_info: Object.keys(nodeInfo.data.link_info || {}).map((key) => nodeInfo.data.link_info[key]),
            lqm: nodeInfo.data.lqm
          });
        }
      });
      this.setState({ nodesData: nodesData, lastUpdated: stored.data.date });
      const date = new Date(stored.data.date);
      if ((new Date() - date) > 24 * 60 * 60 * 1000) {
        alertify.alert("Warning", "Node data was last updated on " + date.toLocaleString());
      }
    }
    catch (e) {
      alertify.alert(e.toString());
    }
  }

  async componentDidMount() {
    const appConfig = await axios.get('appConfig.json')
    this.setState({appConfig: appConfig.data})
    document.title = `${this.state.appConfig.contactInfo.callsign} - ${process.env.REACT_APP_NAME} ${process.env.REACT_APP_VERSION} by ${process.env.REACT_APP_CREATOR}`;
    this.getNodesData();
  }

  render() {
    const selectNodes = (type) => {
      this.setState({ selected: type });
    }
    return (
      <div>
        <Header nodesData={this.state.nodesData} appConfig={this.state.appConfig} lastUpdated={this.state.lastUpdated} selectNodes={selectNodes}/>
        <BaArednMap nodesData={this.state.nodesData} selected={this.state.selected} appConfig={this.state.appConfig}/>
      </div>
    );
  }
}

export default App;
