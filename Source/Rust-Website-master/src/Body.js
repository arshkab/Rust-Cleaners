import React from 'react';
import { useState } from 'react';
import Git from './Git.js';
import ToolCheckbox from './ToolCheckbox.js';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { HashRouter, Route, Link, BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import './body.css';


//This is the file to edit for input - create a .css file for added styling (ex: body.css or an index.css or both)

function Body(props) {
    const [usr_Url, setUrl] = useState(""); //To get value of url from user
    const [ready, setReady] = useState(false); //For Submit button click
    const [tree, setTree] = useState(false);
    const [selectedFile, setSelectedFile] = useState();
    const [isSelected, setIsSelected] = useState(false);
    const [newtools, setTools] = useState([]);
    let newtool = [];
    let checkboxElement = React.createRef();
    function GetUrl(target) {
        console.log(target); //Print target out to console
        setUrl(target);
    }
    /*
    Comments for React.Fragment Section:
    Line 28: takes input from user and sets usr_Url to e.target.value by calling GetUrl()
    LIne 30: Sets ready to true when submit button is clicked (Done this way so it knows when user is ready)
    Line 34: If button is clicked, sets ready to true which triggers Git to be called
    (Body.js url variable gets passed into Git.js and used in Git.js** and then Git.js 'return' output is printed to screen.)
    
    */
    const changeHandler = (event) => {
        let reader = new FileReader();
        reader.readAsDataURL(event.files[0]);
        reader.onload = (e) =>{
            setSelectedFile({data: reader.result.split(',').pop(), fileName: event.files[0].name})
        };
        console.log(event.files[0].name);
        setIsSelected(true);
        //this.toast.show({severity: 'info', summary:'Success', detail:'File uploaded successfully'});
    };


    const handleSubmission = (categories) => {
        let server_Url = window.location.origin + "";
        window.location.hash = "/results";
        /*if (process.env.AWS_DEFAULT_REGION) {
            server_Url = process.env.REACT_APP_SERVER_URL;
            console.log("AWS");

            // Else, it must be running locally
        } else {
            server_Url = "http://localhost:8080"
            console.log("LOCAL");
        }*/
        <Link to="/results"></Link>
        newtool = checkboxElement.current.state.selectedCategories.map(element => element.name);
        setTools(newtool);
        setReady(true);
        if (isSelected) {
            axios.post(server_Url+'/upload', selectedFile);
        }
    };

    //TODO: Specify file size & file type

    // If the URL already specifies the request ID
    if (props.id != -1) {
        console.log("id not -1");
        setUrl(props.id);
        setReady(true);
        props.id = -1;
    }

    return (
        <React.Fragment>
            {ready ? <div>
                <Git usr_Url={usr_Url} newtools={newtools} isSelected={isSelected} selectedFile={selectedFile} />
            </div> :
                <div >
                    <ToolCheckbox ref={checkboxElement} />
                    <div style={{ display: 'inline-block' }}>
                        <span className="p-float-label">
                            <InputText id="usr_urL" value={usr_Url} onChange={e => GetUrl(e.target.value)} />
                            <label htmlFor="usr_urL" style={{ color: 'grey' }}> Enter GitHub URL</label>
                        </span>
                    </div>

                    <div>
                        <p>Or upload files to be analyzed (.zip)</p>
                        <FileUpload mode="basic" name="selectedFile" url='../downloads' style={{zIndex: 10}} customUpload uploadHandler={e=> changeHandler(e)}/>

                        <div>
                            <br></br>
                            <Button label="Submit" className='p-button-raised p-button-sm' style={{zIndex: 10}} onClick={e => handleSubmission(e)} />
                        </div>
                    </div>
                </div>}
            <br></br>
            <br></br>
        </React.Fragment>
    )
}

export default Body;
