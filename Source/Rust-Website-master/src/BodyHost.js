import React, { Component } from 'react';
import Body from './Body.js';
import './App.css'
export class BodyHost extends Component {
    constructor(props) {
        super();
        this.id = -1;
    }

    render() {
        // Check for ID in the URL query, send to Body
        let id = window.location.hash.substring(13);
        if (id.length === 21) {
            this.id = id;
        }

        console.log("BodyHost")
        return(
            <div className='App'>
                <Body id={this.id} />
            </div>
        )
    }
}

export default BodyHost;