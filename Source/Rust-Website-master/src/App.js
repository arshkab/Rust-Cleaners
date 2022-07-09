import React, { Component } from 'react';
import Welcome from './Welcome.js';
import { BrowserRouter, Routes, Route, HashRouter, Link } from "react-router-dom";
import './App.css';
import { Home } from './Home.jsx';
import { Documentation } from './Documentation.js';
import { Team } from './Team.jsx';
import { Tools } from './Tools.jsx';
import { BodyHost } from './BodyHost.js';
import TabMenuDemo from './TabMenuDemo.js';

class App extends Component {
  render() {
    return (
      <div>
  
        <TabMenuDemo style="height: 10vh" />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/input" element={<BodyHost />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/team" element={<Team />} />
          <Route path="/results" element={<BodyHost />} />
        </Routes>

        <div className='App'>
          <div id='stars'></div>
          <div id='stars2'></div>
          <div id='stars3'></div>
        </div>

      </div>
    )
  }
}
export default App;

