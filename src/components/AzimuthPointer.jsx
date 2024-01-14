import React, { Component } from "react";
import { Marker } from "react-leaflet";
import { Icon } from "leaflet";

const GrayArrow = new Icon({
  iconUrl: "./mesh_arrow_75px_gray.png",
  iconSize: [25, 25],
});

class AzimuthPointer extends React.Component {
  render() {
    if (isNaN(this.props.azimuth)) {
      return "";
    }
    return (
      <Marker
        position={[this.props.lat, this.props.lon]} // Adjust the position as needed
        icon={GrayArrow}
        rotationAngle={parseInt(this.props.azimuth) - 45} // Rotate the arrow icon based on azimuth and correct -45 degrees
        rotationOrigin="center" // Rotate around the center of the arrow icon
      />
    );
  }
}
  
export default AzimuthPointer;