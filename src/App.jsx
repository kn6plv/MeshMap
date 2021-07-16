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
    appConfig: [],
    nodesData: []
  }
  
  // Get the details from the node. Recieves the name of the node.
  async retrieveNodeDetails(node)
  {
    try {
    const nodeInfo = await axios.get(`http://${node.ip}${sysinfo.resource}/?${sysinfo.params.link_info}`)

    if (nodeInfo.status === 200)
    {   if(nodeInfo.lat !== "") {
        const node = {
              node: nodeInfo.data.node,
              lat: nodeInfo.data.lat,
              lon: nodeInfo.data.lon,
              meshrf : nodeInfo.data.meshrf,
              node_details: nodeInfo.data.node_details,
              interfaces: nodeInfo.data.interfaces,
              link_info: Object.keys(nodeInfo.data.link_info).map((key) => nodeInfo.data.link_info[key])
        }
      
      //  Add this node to the state
      this.setState({nodesData: [...this.state.nodesData, node]})
      //console.log("nodesData",this.state.nodesData)
      } 
    }
    else {}
  }  catch(e) {console.log(`There was an error getting ${node.name} details`)}
  }

  async getNodesData() {
    try {
    // Get the list of nodes / hosts before to retrieve the nodes information.
    //const nodes =  await axios.get(`http://${mynode.name}${sysinfo.resource}${sysinfo.params.hosts}`) 
    const nodes =  await axios.get(`http://localnode.local.mesh${sysinfo.resource}${sysinfo.params.hosts}`) 

    if(nodes.status !== 200) {
      //alert("ERROR")
      alertify.alert("Unable to find your AREDN node, please verify if you are connected to the MESH.");
    }

    else {
    // Get only the ones that matches the format CALLSIGN-CITY-COUNTRY-TYPE#NODENUMBER 
    const regex = new RegExp(this.state.appConfig.nodesFilter);
    //const regex = "[a-zA-z]+[0-9][a-zA-Z]+[-][a-zA-Z]+[-][a-zA-Z]+[-][a-zA-Z]*[1-9]+"

    //const regex = new RegExp("[a-zA-z]");

    console.log(regex,"REGEX")
    //console.log(this.state.appConfig.nodesFilter, "NODESFILTER")
    const filteredNodeList = nodes.data.hosts.filter(h => h.name.toUpperCase().trim().match(regex))
    console.log("Filtered Node List",filteredNodeList)

    // Iterate thru each node to get the details.
    Object.keys(filteredNodeList).forEach((key) => {
      this.retrieveNodeDetails(filteredNodeList[key])
    });
  }
}
  catch(e) {
    alertify.alert("Unable to find your AREDN node, please verify if you are connected to the MESH.");
  }
}

  async componentDidMount() {
    const appConfig = await axios.get('appConfig.json')
    //console.log(appConfig.data)
    this.setState({appConfig: appConfig.data})
    //console.log(appConfig.data,"appConfig.data")
    //console.log(this.state,"STATE")
    document.title = `${this.state.appConfig.contactInfo.callsign} - ${process.env.REACT_APP_NAME} ${process.env.REACT_APP_VERSION} by ${process.env.REACT_APP_CREATOR}`;
    this.getNodesData();
    //console.log(this.state.appConfig.app.nodesFilter, "NODES FILTER")
  }

  render() {
    return (
      //<Container fluid>
        <div>       
          <Header nodesData={this.state.nodesData} appConfig={this.state.appConfig}></Header>      
          <BaArednMap nodesData={this.state.nodesData} appConfig={this.state.appConfig}/>                  
        </div>
      //</Container>
    );
  }
}

export default App;
