import React, { Component } from 'react';
import Fieldsets from './Fieldsets.js';
import { InputTextarea } from 'primereact/inputtextarea';

export class Documentation extends Component {
    
    render(){
        const InputTextarea = () => {
           
            const [value2, setValue2] = useState('');
        }
        console.log("Documentation");
        
           
        return(
            <div className="info-page">
                <h2 class ="one">Rust Cleaner Documentation</h2>
                <h3 class ="two">Welcome to the Rust Cleaner Documentation!</h3>
                <br></br>
                <h3 class="two">Rust Cleaner is a Software-as-a-Service tool which allows users to quickly and clearly review their code. Our service aims to help Rust developers easily observe security vulnerabilities and errors without having to download multiple static analysis tools.</h3>
                <br></br>
                <h3 class ="two">Using the service:</h3>
                <ol class = "one">
                    <li class ="one">Choose which tools you would like to run</li>
                    <li class = "one">Enter GitHub link or upload a directory.</li>
                    <li class = "one">View highlighted errors on results page!</li>

                </ol>
                <Fieldsets/>
                

             
            </div>
           
        );
    }
}

export default Documentation;