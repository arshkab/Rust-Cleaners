import React, { Component } from 'react';
import { TabMenu } from 'primereact/tabmenu';
import {Menubar} from 'primereact/menubar';
import './body.css';
import { HashRouter, Route, Link, BrowserRouter } from 'react-router-dom';

export class TabMenuDemo extends Component {

    constructor(props) {
        super(props);

        this.state = {
            activeIndex: 3
        }

    }
    navigateToPage1 = (path) => {
        window.location.hash = path;
        <Link to="/"></Link>
    }
    navigateToPage2 = (path) => {
        window.location.hash = path;
        <Link to="/input"></Link>
    }
    navigateToPage3 = (path) => {
        window.location.hash = path;
        <Link to="/documentation"></Link>
    }

    navigateToPage4 = (path) => {
        window.location.hash = path;
        <Link to="/team"></Link>

    }
    

    render() {
        let custome = <Link to="/">
        <img src='./logo_copy.png' style={{height: '8rem', maxWidth:'100%', imageRendering:'-webkit-optimize-contrast'}} />
        </Link>
        this.items = [
            { label: 'Input', icon: 'pi pi-fw pi-pencil', command: () => { this.navigateToPage2("/input") } },
            { label: 'Documentation', icon: 'pi pi-fw pi-file', command: (event) => { this.navigateToPage3("/documentation") } },
            { label: 'Team', icon: 'pi pi-users', command: (event) => { this.navigateToPage4("/team") } }
        ];
        return (
            <div>

                <div className="card">

                    <Menubar model={this.items} start={custome} style={{height: '4rem', zIndex:'15'}}/>

                </div>



            </div>
        );
    }
}


export default TabMenuDemo;