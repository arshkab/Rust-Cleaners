import React from 'react';
import { useState } from 'react';

import { Button } from 'primereact/button';
import { Documentation } from './Documentation.js';
import './body.css';
import { HashRouter, Route, Link, BrowserRouter } from 'react-router-dom';

function Welcome() {
    const [pageCount, setPageCount] = useState(0);
    const [ready, setReady] = useState(true);

    const handleStart = (e) => {
        window.location.hash = "/input";
        <Link to="/input"></Link>
        //setPageCount(2);
        setReady(false);
       

    };
    const handleLearn = (e) => {
        window.location.hash = "/documentation";
        <Link to="/documentation"></Link>
        setPageCount(3);
        setReady(false);
    }
    return (
        
        <div>
            <React.Fragment>
                {ready ?
                    <div>
                        <h1>
                            Welcome to Rust Cleaner!
                        </h1>
                        <h2>
                            Rust Security Software as a Service - Host of multiple static analysis tools for Rust projects
                        </h2>
                        <Button label="Start Analyzing" className='p-button-raised' style={{zIndex: '15'}} onClick={e => handleStart(e)} />
                        <br></br>
                        <Button label="Learn more" className='p-button-raised p-button-sm' style={{zIndex: '15', marginTop:'1%'}} onClick={e => handleLearn(e)} />
                    </div>
                    : 
                    <div>
                        {pageCount == 2 ? <BodyHost /> : <div></div>}
                        {pageCount == 3 ? <Documentation /> : <div></div>}
                    </div>}
            </React.Fragment>
        </div>
    )
}
export default Welcome;
