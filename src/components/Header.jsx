import React, { Component } from "react";
import { Image } from "react-bootstrap";

class Header extends Component {

  state = { }

  countNodes(nodesData, band) {
    switch(band) {
      case 900:
        return nodesData.filter(n => n.meshrf.freq && n.meshrf.status === "on" && n.meshrf.freq.startsWith("900")).length;
      case 24:
        return nodesData.filter(n => n.meshrf.freq && n.meshrf.status === "on" && n.meshrf.freq.startsWith("2")).length;
      case 34:
        return nodesData.filter(n => n.meshrf.freq && n.meshrf.status === "on" && (n.meshrf.freq.startsWith("3") || (n.meshrf.channel >= 3380 && n.meshrf.channel <= 3495))).length;
      case 58:
        return nodesData.filter(n => n.meshrf.freq && n.meshrf.status === "on" && n.meshrf.freq.startsWith("5") && !(n.meshrf.channel >= 3380 && n.meshrf.channel <= 3495)).length;
      case 'off':
        return nodesData.filter(n => n.meshrf.status === "off").length;
      case 'all':
      default:
        return this.countNodes(nodesData, 900) + this.countNodes(nodesData, 900) + this.countNodes(nodesData, 24) + this.countNodes(nodesData, 34) + this.countNodes(nodesData, 58) + this.countNodes(nodesData, 'off');
    }
  }

  render() {
    if (!this.props.appConfig) {
      return null;
    }
    return (
      <div className="Header">
        <div className="title">{this.props.appConfig.name}</div>
        <table>
          <tr>
            <td>Band</td>
            <td>Nodes</td>
          </tr>
          <tr>
            <td>  <Image src="./magentaRadioCircle-icon.png" width={20}></Image> 900 MHz </td>
            <td>{ this.countNodes(this.props.nodesData, 900)} </td>
          </tr>
          <tr>
            <td> <Image src="./purpleRadioCircle-icon.png" width={20}></Image> 2.4 GHz </td>
            <td>{this.countNodes(this.props.nodesData, 24)}</td>
          </tr>
          <tr>
            <td> <Image src="./blueRadioCircle-icon.png" width={20}></Image> 3.4 GHz </td>
            <td>{this.countNodes(this.props.nodesData, 34)}</td>
          </tr>
          <tr>
            <td><Image src="./goldRadioCircle-icon.png" width={20}></Image> 5 GHz </td>
            <td>{this.countNodes(this.props.nodesData, 58)}</td>
          </tr>
          <tr>
            <td><Image src="./grayRadioCircle-icon.png" width={20}></Image> No RF </td>
            <td>{this.countNodes(this.props.nodesData, 'off')}</td>
          </tr>
          <tr>
            <td style={{paddingLeft:33}}>Total</td>
            <td>{this.countNodes(this.props.nodesData, 'all')}</td>
          </tr>
        </table>
        {
          !this.props.lastUpdated ?
            <div className="footer">Last updated {(new Date().toLocaleString())}</div> :
            <div>
              <div className="footer">Download CSV data <a href="data/out.csv" target="_blank">here</a></div>
              <div className="footer">Last updated {(new Date(this.props.lastUpdated).toLocaleString())}</div>
            </div>
        }
      </div>
    );
  }
}

export default Header;
