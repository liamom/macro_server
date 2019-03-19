import React, { Component, PureComponent } from 'react';
import { BrowserRouter, NavLink, Route } from 'react-router-dom'
import logo from './logo.svg';
import './style/App.css';
import './style/tile.css';
import TileData from './TileData'
import Settings from './settings'
import TilesView from './TilesView'


export interface AppProps {}
export class AppData {}

class App extends Component<AppProps, {}> {
  public readonly data: TileData[] = [
      new TileData("name 1", "action 1"),
      new TileData("name 2", "action 2")  
    ];

  constructor(props: AppProps) {
    super(props);
  }

  render() {
    return (
      <BrowserRouter>
        <div id="header">
          <NavLink exact to="/tiles" id="tiles">Tiles</NavLink>
          <NavLink exact to="/settings" id="settings">Settings</NavLink>
        </div>
        <Route exact path="/settings" component={Settings} />
        <Route exact path="/tiles" component={TilesView} />
      </BrowserRouter>
    )
  }
}



export default App;
