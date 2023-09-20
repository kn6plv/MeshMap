import React, { Component } from "react";
import { Image } from "react-bootstrap";

class Header extends Component {

  state = { 
    selected: 'all'
  }

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
      case 'supernode':
        return nodesData.filter(n => n.node_details.mesh_supernode).length;
      case 'off':
        return nodesData.filter(n => n.meshrf.status === "off").length;
      case 'all':
      default:
        return this.countNodes(nodesData, 900) + this.countNodes(nodesData, 900) + this.countNodes(nodesData, 24) + this.countNodes(nodesData, 34) + this.countNodes(nodesData, 58) + this.countNodes(nodesData, 'off');
    }
  }

  selectNodes(type) {
    if (type === this.state.selected) {
      type = 'all';
    }
    this.setState({ selected: type });
    this.props.selectNodes(type);
  }

  render() {
    if (!this.props.appConfig) {
      return null;
    }
    const counts = {
      b900: this.countNodes(this.props.nodesData, 900),
      b24: this.countNodes(this.props.nodesData, 24),
      b34: this.countNodes(this.props.nodesData, 34),
      b58: this.countNodes(this.props.nodesData, 58),
      supernode: this.countNodes(this.props.nodesData, 'supernode'),
      off: this.countNodes(this.props.nodesData, 'off'),
      all: this.countNodes(this.props.nodesData, 'all')
    };
    return (
      <div className="Header">
        <div className="title">{this.props.appConfig.name}</div>
        <table>
          <tr>
            <td>Band</td>
            <td>Nodes</td>
          </tr>
          {
            counts.b900 ? <tr className={ 'b900-' + this.state.selected }>
              <td><a href="#" onClick={()=>this.selectNodes('900')}><Image src="./mesh_icon_75px_purple.png" width={20}></Image> 900 MHz</a></td>
              <td>{counts.b900}</td>
            </tr> : ""
          }
          {
            counts.b24 ? <tr className={ 'b24-' + this.state.selected }>
              <td><a href="#" onClick={()=>this.selectNodes('24')}><Image src="./mesh_icon_75px_purple.png" width={20}></Image> 2.4 GHz</a></td>
              <td>{counts.b24}</td>
            </tr> : ""
          }
          {
            counts.b34 ? <tr className={ 'b34-' + this.state.selected }>
              <td><a href="#" onClick={()=>this.selectNodes('34')}><Image src="./mesh_icon_75px_blue.png" width={20}></Image> 3.4 GHz</a></td>
              <td>{counts.b34}</td>
            </tr> : ""
          }
          {
            counts.b58 ? <tr className={ 'b58-' + this.state.selected }>
              <td><a href="#" onClick={()=>this.selectNodes('58')}><Image src="./mesh_icon_75px_gold.png" width={20}></Image> 5 GHz</a></td>
              <td>{counts.b58}</td>
            </tr> : ""
          }
          {
            counts.supernode ? <tr className={ 'supernode-' + this.state.selected }>
              <td><a href="#" onClick={()=>this.selectNodes('supernode')}><Image src="./mesh_icon_75px_green.png" width={20}></Image> Supernode</a></td>
              <td>{counts.supernode}</td>
            </tr> : ""
          }
          {
            counts.off ? <tr className={ 'off-' + this.state.selected }>
              <td><a href="#" onClick={()=>this.selectNodes('off')}><Image src="./mesh_icon_75px_gray.png" width={20}></Image> No RF</a></td>
              <td>{counts.off}</td>
            </tr> : ""
          }
          <tr>
            <td style={{paddingLeft:33}}><a href="#" onClick={()=>this.selectNodes('all')}>Total</a></td>
            <td>{counts.all}</td>
          </tr>
        </table>
        {
          !this.props.lastUpdated ?
            <div className="footer">Last updated {(new Date().toLocaleString())}</div> :
            <div>
              <div className="footer">Download CSV data <a href="data/out.csv" target="_blank">here</a></div>
              <div className="footer">And KML data <a href="data/out.kml" target="_blank">here</a></div>
              <div className="footer">Mesh map phone compass <a href="compass">here</a></div>
              <div className="footer">Last updated {(new Date(this.props.lastUpdated).toLocaleString())}</div>
            </div>
        }
      </div>
    );
  }
}

export default Header;
