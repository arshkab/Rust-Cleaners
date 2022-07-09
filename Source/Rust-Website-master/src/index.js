import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Git from './Git';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, HashRouter, Router, Route } from 'react-router-dom';
import { Home } from './Home.jsx';
import { Tools } from './Tools.jsx';



ReactDOM.render(
  //<React.StrictMode>
 
  
   <HashRouter>

      <App/>

   </HashRouter>,
    
  //</React.StrictMode>,

  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
