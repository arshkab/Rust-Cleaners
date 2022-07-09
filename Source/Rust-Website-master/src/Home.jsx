import React, { Component } from 'react';
import Welcome from './Welcome.js';
import './App.css'
export class Home extends Component {
    render(){
        console.log("Home")
        return(
            <div className='App'>
                <Welcome />
            </div>
        )
    }
}

export default Home;