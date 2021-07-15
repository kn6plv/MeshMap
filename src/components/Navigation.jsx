import Navbar from 'react-bootstrap/Navbar';
import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import HomePageJumbotron from "./HomePageJumbotron";
import Inicio from "./Inicio";
import MapGLPRAred from  "./MapGLPRAred"
import BaArednMap from "./BaArednMap"
import ArednMap from './ArednMap'

class Navigation extends Component {
  render() {
    return (
      <Router>
        <div>
          <Navbar bg="dark" variant="dark" collapseOnSelect expand="lg">
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Link className="nav-link" role="button" to="/">
              Inicio
            </Link>
            <Link className="nav-link" to="/mapa" role="button">
              Mapa
            </Link>
            <Link className="nav-link" role="button" to="/about">
              About
            </Link>
            <Link className="nav-link" role="button" to="/users">
              Users
            </Link>
          </Navbar>
          <br/>
          <br/>

          {/* A <Switch> looks through its children <Route>s and
              renders the first one that matches the current URL. */}
          <Switch>
            <Route path="/about">
              {" "}
              {/*<HomePageJumbotron />*/}
            </Route>
            <Route path="/users"></Route>
            <Route path="/mapa">
              <BaArednMap/>
            </Route>
            <Route path="/">
              <Inicio />
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }
}



export default Navigation;
