import React, { Component } from "react";
import './body.css';
import './App.css';
let usr_Url = ""; //Not a const bc changes based on user input 
let server_Url = "";
let hasfile = false;
let tools = [];
let outpArray = [];
let jsonvals = [];
let filename = "";
//Preset sorted list based on scripts and https://rust-lang.github.io/rust-clippy/master/
var clippyList = new Map();
//Filters by severity of lint
let clippyFilterd = [];
let avoid_resending = [];
export const clientId = "a30152e007a551a475fc";
import clippy_categories from './scripts/clippy_categories.txt';
import { ProgressBar } from 'primereact/progressbar';
import { Accordion, AccordionTab } from 'primereact/accordion';
import FileTree from './FileTree.js';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { SelectButton } from 'primereact/selectbutton';
import { Card } from 'primereact/card';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/hljs';

var res = "";
//Solution from: https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
var groupBy = function(xs, key){
    return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
};

var AWS = require('aws-sdk');
const SES_CONFIG = {
    accessKeyId: 'AKIAUVUQ3CXK5IFLTG6Y',
    secretAccessKey: '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',
    region: 'us-east-1',
};

const AWS_SES = new AWS.SES(SES_CONFIG);
/*
-Components are loaded into the App.js (main file) to bring in different aspects of the website
-Can create new pages but not necessary since the React we're using is Client based (Will likely change as project
progress)
-Constructors are required, including a call to super() - parent aka 'Component' class
-----Thoughts on next steps--------
--Need another js that uses this input?
--Call that js file when Git returns prompting that file's (the file that actually runs the analysis) output to be seen
*/
class Git extends Component {

    constructor(props) { //props = variables from Body.js needed to be passed into separate .js file & class

        super(props);
        tools = props.newtools;
        console.log("Tools:", tools);
        usr_Url = props.usr_Url;
        hasfile = props.isSelected;
        if(hasfile){
            filename = props.selectedFile.fileName;
        }

        this.state = {
            token: '6fbb961f2df2888af509820394e1904502c79a72', //App's token - will need to put in environment file, For other access tokens, create your own or contact Olivia
            data: '',
            clone_url: '', //'Git clone' URL to download code onto server
            has_data: false,
            has_id: false,
            outArray: [],
            JSONedArray: [],
            sortedCargoArr:[],
            selectedTab: 0,
            EmailAdr: "",
            warnings: null,
            localurl: "",
			warningCode: [],
            md: null,
            displayType: 'P',
            email_sent: false,
            errCounts: { "total": 0, "correctness": 0, "suspicious": 0, "complexity": 0, "perf": 0, "style": 0, "low priority": 0 }
        };

        this.selectDisplayType = [
            {label: 'Priority', value: 'P'},
            {label: 'Files', value: 'F'}
        ];

        this.resizeDown = this.resizeDown.bind(this);
        this.resizeMove = this.resizeMove.bind(this);
        this.GetClipyLints();
    }

    async downloadCode() {
        server_Url = window.location.origin;
        /*if (process.env.AWS_DEFAULT_REGION) {
            serverUrl = process.env.REACT_APP_SERVER_URL;
            console.log("AWS");

            // Else, it must be running locally
        } else {
            serverUrl = "http://localhost:8080"
            console.log("LOCAL");
        }*/

        var code = [];
        var file = [];
        for (var i = 0; i < (this.state.warnings).length; i++) {
            file.push(this.state.warnings[i].filename);
            await fetch(server_Url + '/localfile', {
                method: 'POST',
                mode: 'cors',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 'fileDir': file[i] })
            }).then((response) => {
                response.json().then((result) => {
                    var thisCode = ([result.filename]).concat((result.Output).split(/\r?\n/));
                    code.push(thisCode);
                });
            });
        }
        await this.SetLintArr();
        await this.setState({ warningCode: code, });
    }

    RunUploads() {
        // Failed attempt to dynamically set the fetch URL depending on the environment
        console.log(process.env.AWS_DEFAULT_REGION);
        // If the default region is declared, must be running on AWS
        //server_Url = "http://rustcleaner-env-1.eba-umpfrvt8.us-east-1.elasticbeanstalk.com";
        console.log(process.env.AWS_DEFAULT_REGION);
		server_Url = window.location.origin;
        /*if (process.env.AWS_DEFAULT_REGION) {
            server_Url = process.env.REACT_APP_SERVER_URL;
            console.log("AWS");

            // Else, it must be running locally
        } else {
            server_Url = "http://localhost:8080"
            console.log("LOCAL");
        }*/
        let local_Url = "";
        console.log('Sending tools');
        fetch(server_Url + '/filesubmit', { // backend url
            method: 'POST', //post request
            mode: 'cors', // with cors
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' }, //send and receive a json
            body: JSON.stringify({ 'tools': tools, 'Filename': filename}) //make the json
        }).then((response) => {
            //console.log("Response:"+response);
            response.json().then((result) => {
                this.setState({ data: JSON.stringify(result['output']) });
                if (this.state.data) {
                    fetch(server_Url + '/localfile', {
                        method: 'POST',
                        mode: 'cors',
                        credentials: 'same-origin',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 'fileDir': './downloads/clippy.json' })
                    }).then((result) => {
                        result.json().then((parsed) => {
                            this.setState({ warnings: JSON.parse(parsed.Output) }, () => { this.downloadCode(); }); //, () => { this.downloadCode(); }
                        });
                    });

                    fetch(server_Url + '/localfile', {
                        method: 'POST',
                        mode: 'cors',
                        credentials: 'same-origin',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 'fileDir': './downloads/rc_cargo_mirai_results/cargo_mirai_output0.json' })
                    }).then((result) => {
                        result.json().then((parsed) => {
                            this.setState({ warnings: JSON.parse(parsed.Output) }, () => { this.downloadCode(); }); //, () => { this.downloadCode(); }
                        });
                    });
                    outpArray = this.parseData();
                    this.setState({ outArray: outpArray });
                    console.log(this.state.outArray);
                    this.setState({ JSONedArray: this.FillJsonArray() }); //Place this in a different state array?
                    //Organize cargo audit by group
                    this.setState( {sortedCargoArr: groupBy(this.state.JSONedArray, 'Crate')});
                    const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);
                    console.log("Avoid_resending",avoid_resending)
                    if(countOccurrences(avoid_resending,local_Url) < 2){

                        this.setState({ localurl: `${server_Url}/#${local_Url}` });
                        this.sendEmail(this.state.EmailAdr,`${server_Url}/#${local_Url}`);
                        this.setState({email_sent:true});
                       
                    }
                 
                  



                }
            })
        });
    }

    sendURL(url) { // send the given url to the backend for download
        
        
		server_Url = window.location.origin;
        /*if (process.env.AWS_DEFAULT_REGION) {
            server_Url = process.env.REACT_APP_SERVER_URL;
            console.log("AWS");

            // Else, it must be running locally
        } else {
            server_Url = "http://localhost:8080"
            console.log("LOCAL");
        }*/
        let local_Url = "";
        // Run the fetch request to the url previously found
        if(!hasfile) {
            // Get an ID assigned with the user's submission
            fetch(server_Url + '/submit', {
                method: 'POST',
                mode: 'cors',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 'repo': url, 'tools': tools })
            }).then((response) => {
                response.json().then((result) => {
                    window.location.hash = `/results?id=${result['id']}`; // Change URL to include ID
                    local_Url = `/results?id=${result['id']}`;
                    avoid_resending.push(local_Url);
                    this.setState({ has_id: true });
                    //console.log(server_Url);
                    //console.log(this.state.EmailAdr);
                    //this.sendEmail("arsh@tamu.edu",`/results?id=${result['id']}`);
                    // Run tools and receive results
                    fetch(server_Url + '/github', { // backend url
                        method: 'POST', //post request
                        mode: 'cors', // with cors
                        credentials: 'same-origin',
                        headers: { 'Content-Type': 'application/json' }, //send and receive a json
                        body: JSON.stringify({ 'id': result['id'] }) //make the json
                    }).then((response) => {
                        //console.log("Response:"+response);
                        response.json().then((result) => {
                            this.setState({ data: JSON.stringify(result['output']) });
                            if (this.state.data) {
                                fetch(server_Url + '/localfile', {
                                    method: 'POST',
                                    mode: 'cors',
                                    credentials: 'same-origin',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ 'fileDir': './downloads/clippy.json' })
                                }).then((result) => {
                                    result.json().then((parsed) => {
									this.setState({warnings: JSON.parse(parsed.Output)}, () => { this.downloadCode();}); //, () => { this.downloadCode(); }
									});
                                });

                                fetch(server_Url + '/localfile', {
                                    method: 'POST',
                                    mode: 'cors',
                                    credentials: 'same-origin',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ 'fileDir': './downloads/rc_cargo_mirai_results/cargo_mirai_output0.json' })
                                }).then((result) => {
                                    result.json().then((parsed) => {
                                        this.setState({ warnings: JSON.parse(parsed.Output) }, () => { this.downloadCode(); }); //, () => { this.downloadCode(); }
                                    });
                                });
                                outpArray = this.parseData();
                                console.log("Output", outpArray)
                                this.setState({ outArray: outpArray });
                                this.setState({ JSONedArray: this.FillJsonArray() }); //Place this in a different state array?
                                console.log(this.state.JSONedArray);
                                console.log(server_Url);
                                console.log(this.state.EmailAdr);
                                this.setState( {sortedCargoArr: groupBy(this.state.JSONedArray, 'Crate')});
                                this.setState({ localurl: `${server_Url}/#${local_Url}` });
                                this.sendEmail(`${this.state.EmailAdr}`,`${server_Url}/#${local_Url}`);
                                this.setState({email_sent:true});
                                

                            }
                        })
                    });
                });
            });
            console.log("Local url",this.state.localurl);
        }
        else {

        }
    }


    parseData() {
        if (this.state.data !== '') {
            this.setState({ has_data: true });
            res = this.state.data;
            const outpt = res.split(/NextTool:\\n/);
            //.filter(element => element);
            return outpt;
        }
        return;
    }

    FillJsonArray() {
        //Objects to be placed in array
        if (this.state.data === '') {
            return;
        }
        //Later feature
        let titleObj = '{"Toolname":"","Number":""}';
        let jsonObj = '{"Crate":"", "Version":"", "Date":"","Title":"","ID":"", "URL":"","Description":"","Solution":""}';
        let jObj = JSON.parse(jsonObj);
        //Specific to cargo audit output
        for (var i = 1; i < this.state.outArray.length; i++) {
            //Crate
            let jsonObj = '{"Crate":"", "Version":"", "Date":"","Title":"","ID":"", "URL":"","Description":"","Solution":""}';
            let jObj = JSON.parse(jsonObj);
            var indx = this.state.outArray[i].indexOf('\\n');
            if (indx !== -1) {
                jObj['Crate'] = this.state.outArray[i].substring(8, indx);
            }
            //Version
            var nxtindx = this.state.outArray[i].indexOf('Version:', indx + 1);
            indx = this.state.outArray[i].indexOf('Date', nxtindx);
            if (indx === -1) {
                indx = this.state.outArray[i].length + 1;
            }
            if (nxtindx !== -1) {
                jObj['Version'] = this.state.outArray[i].substring(nxtindx + 8, indx - 2);
            }
            //Date
            nxtindx = this.state.outArray[i].indexOf('Title', nxtindx + 1);
            if (nxtindx === -1) {
                nxtindx = this.state.outArray[i].length + 1;
            }
            if (indx !== -1) {
                jObj['Date'] = this.state.outArray[i].substring(indx + 6, nxtindx - 2);
            }
            //Title
            indx = this.state.outArray[i].indexOf('ID', nxtindx + 1);
            if (indx === -1) {
                indx = this.state.outArray[i].length + 1;
            }
            if (nxtindx !== -1) {
                jObj['Title'] = this.state.outArray[i].substring(nxtindx + 7, indx - 2);
            }
            //ID
            nxtindx = this.state.outArray[i].indexOf('URL', nxtindx + 1);
            if (nxtindx === -1) {
                nxtindx = this.state.outArray[i].length + 1;
            }
            if (indx !== -1) {
                jObj['ID'] = this.state.outArray[i].substring(indx + 4, nxtindx - 2);
            }
            //URL
            indx = this.state.outArray[i].indexOf('Description', indx + 1);
            if (indx === -1) {
                indx = this.state.outArray[i].length + 1;
            }
            if (nxtindx !== -1) {
                jObj['URL'] = this.state.outArray[i].substring(nxtindx + 5, indx - 2);
            }
            //Description
            nxtindx = this.state.outArray[i].indexOf('Solution', nxtindx + 1);
            if (nxtindx === -1) {
                nxtindx = this.state.outArray[i].length + 1;
            }
            if (indx !== -1) {
                jObj['Description'] = this.state.outArray[i].substring(indx + 13, nxtindx - 2);
            }
            //Solution
            indx = this.state.outArray[i].indexOf('\\n', nxtindx + 10);
            if (indx === -1) {
                indx = this.state.outArray[i].length + 1;
            }
            if (nxtindx !== -1) {
                jObj['Solution'] = this.state.outArray[i].substring(nxtindx + 11, indx);
            }
            jsonvals.push(jObj);
        }
        //console.log(JSON.stringify(jsonvals));
        return jsonvals;
    }

    componentDidMount() {
        if(hasfile) {
            this.RunUploads();
            console.log('Run on fileuploads');
        }else {
            this.sendURL(usr_Url);
            console.log("2");
            //this.sendEmail("arsh@tamu.edu",this.state.localurl);
        }
    }

    handle
    componentWillUnmount() {
        clearInterval(this.interval);
    }

    setEmail(val) {
        this.setState({ EmailAdr: val });
    }

    sendEmail(recipient,link) {
        if(recipient === ''){
            console.log('empty Email');
        }else{
        console.log("Inside function");
        let params = {
          Source: 'rust_cleaners@rustcleaner.net',
          Destination: {
            ToAddresses: [
              recipient
            ],
          },
          ReplyToAddresses: [],
          Message: {
            Body: {
              Html: {
                Charset: 'UTF-8',
                Data: link
              },
            },
            Subject: {
              Charset: 'UTF-8',
              Data: 'Hi, This is report!',
            }
          },
        };
       return AWS_SES.sendEmail(params).promise();
       
        
        }
    };

    sendsEmail(e) {
        this.setState({email_sent:true});
        return <p>The email will be sent once report is generated!</p>
        //console.log("Sending")
    }

    myColor(pos) {
        if (this.state.selectedTab === pos) {
            return "";
        }
        return "grey";
    }

	codeSplicer(filename, start, end) {
		var correctIndex = -1;
		var code = JSON.parse(JSON.stringify(this.state.warningCode));
		//console.log(code.length);
		
		if (code.length > 0) {
			for (var index = 0; index < code.length; index++) {
				//console.log (filename + "=" + code[index][0])
				if (filename == code[index][0]) {
					correctIndex = index;
					//console.log(correctIndex);
					break;
				}
			}
			if (correctIndex != -1) {
				return (code[correctIndex].slice(start, end + 1)).join("\n");
			}
			
		}
		return "Warning Code not loaded";
	}

    // For resizable horizontal areas
    resizeDown(e) {
        const tree  = document.getElementById("analysis-summary");
        const codeblocks = document.getElementById("warnings");
        const element = document.getElementById("separator");

        this.setState({ md: {e,
            offsetLeft:  element.offsetLeft,
            offsetTop:   element.offsetTop,
            firstWidth:  tree.offsetWidth,
            secondWidth: codeblocks.offsetWidth
            } });

        document.onmousemove = this.resizeMove;
        document.onmouseup = () => {
            document.onmousemove = document.onmouseup = null;
        }
    }

    resizeMove(e) {
        const tree  = document.getElementById("analysis-summary");
        const codeblocks = document.getElementById("warnings");
        const element = document.getElementById("separator");

        var delta = {x: e.clientX - this.state.md.e.clientX,
                    y: e.clientY - this.state.md.e.clientY};

        // Prevent negative-sized elements
        delta.x = Math.min(Math.max(delta.x, -this.state.md.firstWidth),
                this.state.md.secondWidth);

        element.style.left = this.state.md.offsetLeft + delta.x + "px";
        tree.style.width = (this.state.md.firstWidth + delta.x) + "px";
        codeblocks.style.width = (this.state.md.secondWidth - delta.x) + "px";
    }

//Solution from https://namespaceit.com/blog/how-to-read-text-file-in-react
GetClipyLints(){
    let data = '';
    fetch(clippy_categories)
    .then(t => t.text()).then(text => {
        data = text;
        let tempArr = data.replace(/[\r\n]/g, ' ').split(' ');
        //Remove potential empty spaces from array
        var filtTemp = tempArr.filter(function (el) {
            return el != '';
        });
       for(let i = 0; i < filtTemp.length-1; i+=2){
           
           clippyList.set(filtTemp[i], filtTemp[i+1]); 
       }
    });
}

//Matches ruleId to clippyLint
FindClippyLint(ruleId){
    for(const [key, value] of clippyList) {
        if(ruleId.includes(key)){
            return value;
        }
    }
    return 'low priority';
}

async SetLintArr(){
    let tempfilen = '';
    let tempSev = '';
    console.log(clippyList);
    //Loop through warnings & warning.data.results
    for(var i = 0; i < this.state.warnings.length; i++){
        tempfilen = this.state.warnings[i].filename;
        for(var j = 0; j < this.state.warnings[i].data.results.length; j++) {
            let y = this.state.warnings[i].data.results[j];
            tempSev = this.FindClippyLint(y.ruleId);

            var newErrCounts = this.state.errCounts;
            newErrCounts["total"] += 1;
            console.log("total is now", newErrCounts["total"]);
            newErrCounts[tempSev] += 1;
            this.setState({ errCounts: newErrCounts });

            let sev = clippyFilterd.find((element) => element.severity == tempSev);
            if (sev) {
                let a = clippyFilterd.findIndex((element) => element.severity == tempSev);

                // See if file was already added
                let sameFile = clippyFilterd[a].filename.findIndex((element) => element == tempfilen);
                if (sameFile != -1) {
                    clippyFilterd[a].data.results[sameFile].push(y);
                }
                else {
                    clippyFilterd[a].data.results.push([y]);
                    clippyFilterd[a].filename.push(tempfilen);
                }
            } else {
                clippyFilterd.push({
                    "filename":[tempfilen],
                    "severity":tempSev,
                    "data":{
                        "results":[[y]],
                    },
                });
            }
        }
    }    
    console.log('Filtered ', clippyFilterd);
}

    render() {
        // Select active tab on sidebar
        let activeArea;
        let curDisplay;
        if (this.state.selectedTab == 0 && this.state.warnings != null) {
            if (this.state.displayType == 'F') {
                curDisplay = 
                    <Accordion id="warningAccordion" activeIndex={0}>
                        {this.state.warnings.map((x, indx) => (
                            <AccordionTab header={(x.filename).replace("/downloads", "") + ""}>
                                <Accordion id="warningAccordion" multiple>
    
                                    {x.data.results.map((y, indy) => (
                                        <AccordionTab header={y.message.text} headerStyle={{ 'background': '#FFF8DC' }}>
    
                                            <b>Severity:</b> {JSON.stringify(y.level)}
                                            <br></br>
                                            <b>Lint Rule:</b> {JSON.stringify(y.ruleId)}
                                            <br></br>
                                            <b>Error Line Numbers:</b> {y.locations[0].physicalLocation.region.startLine} - {y.locations[0].physicalLocation.region.endLine}
                                            <br></br>
                                            
                                            <SyntaxHighlighter
                                            language={"rust"}
                                            style={darcula}
                                            startingLineNumber={y.locations[0].physicalLocation.region.startLine - 5}
                                            showLineNumbers={true}
                                            wrapLongLines={true}
                                            wrapLines={true}
                                            lineProps={(lineNumber) => {
                                              const style = { display: "block", width: "fit-content" };
                                              if (lineNumber >= y.locations[0].physicalLocation.region.startLine && lineNumber <= y.locations[0].physicalLocation.region.endLine) {
                                                style.backgroundColor = 'rgba(255, 204, 0, .40)';
                                              }
                                              return { style };
                                            }}>
                                                {this.codeSplicer(x.filename, y.locations[0].physicalLocation.region.startLine - 5, y.locations[0].physicalLocation.region.startLine - 1) +
                                                "\n" +
                                                this.codeSplicer(x.filename, y.locations[0].physicalLocation.region.startLine, y.locations[0].physicalLocation.region.endLine) +
                                                "\n" +
                                                this.codeSplicer(x.filename, y.locations[0].physicalLocation.region.endLine + 1, y.locations[0].physicalLocation.region.endLine + 5)}
                                            </SyntaxHighlighter>
                                            
                                        </AccordionTab>
                                        
                                    ))}
                                </Accordion>
                                <Button label="Jump to file" className='p-button-secondary' onClick={() => this.setState({ selectedTab: 2 })}/>
                            </AccordionTab>
                        ))}
                    </Accordion>
            }
            else if (this.state.displayType == 'P') {
                curDisplay = 
                    <Accordion id="warningAccordion" activeIndex={0}>
                        {clippyFilterd.map((x, indx) => (
                            <AccordionTab header={(x.severity)}>
                                <Accordion multiple>
                                {x.filename.map((j, indj) => (
                                    <AccordionTab header={(j).replace("/downloads", "") + ""}>
                                        <Accordion id="warningAccordion" multiple>
            
                                            {x.data.results[indj].map((y, indy) => (
                                                <AccordionTab header={y.message.text} headerStyle={{ 'background': '#FFF8DC' }}>
            
                                                    <b>Severity:</b> {JSON.stringify(y.level)}
                                                    <br></br>
                                                    <b>Lint Rule:</b> {JSON.stringify(y.ruleId)}
                                                    <br></br>
                                                    <b>Error Line Numbers:</b> {y.locations[0].physicalLocation.region.startLine} - {y.locations[0].physicalLocation.region.endLine}
                                                    <br></br>
                                                    
                                                    <SyntaxHighlighter
                                                    language={"rust"}
                                                    style={darcula}
                                                    startingLineNumber={y.locations[0].physicalLocation.region.startLine - 5}
                                                    showLineNumbers={true}
                                                    wrapLongLines={true}
                                                    wrapLines={true}
                                                    lineProps={(lineNumber) => {
                                                    const style = { display: "block", width: "fit-content" };
                                                    if (lineNumber >= y.locations[0].physicalLocation.region.startLine && lineNumber <= y.locations[0].physicalLocation.region.endLine) {
                                                        style.backgroundColor = 'rgba(255, 204, 0, .40)';
                                                    }
                                                    return { style };
                                                    }}>
                                                        {this.codeSplicer(j, y.locations[0].physicalLocation.region.startLine - 5, y.locations[0].physicalLocation.region.startLine - 1) +
                                                        "\n" +
                                                        this.codeSplicer(j, y.locations[0].physicalLocation.region.startLine, y.locations[0].physicalLocation.region.endLine) +
                                                        "\n" +
                                                        this.codeSplicer(j, y.locations[0].physicalLocation.region.endLine + 1, y.locations[0].physicalLocation.region.endLine + 5)}
                                                    </SyntaxHighlighter>
                                                    
                                                </AccordionTab>
                                                
                                            ))}
                                        </Accordion>
                                        <Button label="Jump to file" className='p-button-secondary' onClick={() => this.setState({ selectedTab: 2 })}/>
                                    </AccordionTab>
                                ))}
                                </Accordion>
                            </AccordionTab>
                        ))}
                    </Accordion>
            }

			activeArea = 
            <div class="splitter">
                <div id="analysis-summary">
                    <br></br>
                    <div class="sus-box">
                    WARNINGS:
                    <br></br>
                    {this.state.errCounts["total"]}
                    </div>
                    <br></br>
                    <div style={{ color: 'red' }}>
                    Correctness:
                    <br></br>
                    {this.state.errCounts["correctness"]}
                    </div>
                    <br></br>
                    <div style={{ color: 'orange' }}>
                    Suspicious:
                    <br></br>
                    {this.state.errCounts["suspicious"]}
                    </div>
                    <br></br>
                    <div style={{ color: 'yellow' }}>
                    Style:
                    <br></br>
                    {this.state.errCounts["style"]}
                    </div>
                    <br></br>
                    <div style={{ color: 'green' }}>
                    Complexity:
                    <br></br>
                    {this.state.errCounts["complexity"]}
                    </div>
                    <br></br>
                    <div style={{ color: 'aqua' }}>
                    Performance:
                    <br></br>
                    {this.state.errCounts["perf"]}
                    </div>
                    <br></br>
                    <div style={{ color: 'purple' }}>
                    Low priority:
                    <br></br>
                    {this.state.errCounts["low priority"]}
                    </div>
                    <br></br>
                </div>
                <div id="separator" onMouseDown = { this.resizeDown } ></div>
                <div id="warnings">
                <Card title='Warnings from Clippy'>
                <h5>Filter by:</h5>
                <SelectButton style={{display: 'inline-block', zIndex:'10'}} value={this.state.displayType} options={this.selectDisplayType} onChange={(e) => this.setState({ displayType: e.value })}></SelectButton>
                {curDisplay}
                </Card>
                </div>
            </div>
        }
        else if (this.state.selectedTab == 1) {
            activeArea = 
            <div id="packages">
                    <Card title='Warnings from Cargo Audit:'>
                        <h4 style={{textAlign:'left'}}>Crates:</h4>
                        <Accordion id="warningAccordion" activeIndex={0}>
                            {Object.entries(this.state.sortedCargoArr).map((x, info) => (
                                <AccordionTab header={x[0]}>
                                    <Accordion id="warningAccordion" multiple>
                                        {x[1].map((y, infy) => (
                                            <AccordionTab header={y.Title}>
                                                <b>Description:</b> {y.Description.replace(/(?:\\[rn])+/g, '\n')}
                                                <br></br>
                                                <b>Solution:</b> {y.Solution}
                                            </AccordionTab>
                                        ))}
                                    </Accordion>
                                </AccordionTab>
                            ))}

                </Accordion>
                </Card>
            </div>
        }

        // Determine if part asking for email is shown (only shown once the ID is added to url)
        console.log(this.state.localurl)
        let emailArea;
        const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);
       
        if (this.state.has_id || hasfile) {
            console.log(countOccurrences(avoid_resending,this.state.localurl) < 2);

            if(countOccurrences(avoid_resending,this.state.localurl) < 2) {
                if(this.state.email_sent) {
                    emailArea = 
                    <div>
                        <p style={{color:'black'}}>The email will be sent once report is generated!</p>
                    </div>
                   
                }
                else {
                    emailArea =
                    <div>
                        <p style={{color:'grey'}}>This might take awhile. Sign up for email notification?</p>
                        <div style={{ display: 'inline-block' }}>
                            <span className="p-float-label">
                                <InputText id="EmailAdr" value={this.state.EmailAdr} onChange={e => this.setEmail(e.target.value)} />
                                <label htmlFor="EmailAdr" style={{ color: 'grey' }}> Email</label>
                            </span>
                        </div>
                        <p>  </p>
                        <Button label="Send email" className='p-button-raised p-button-sm' style={{ zIndex: 10 }} onClick={e => this.sendsEmail(e)} />
                    </div>
                }
            }
        }
        else {
            emailArea = <p></p>;
        }

        return (
            <div className="line-break">

                {this.state.data ? (<>
                    <div class="splitter">
                        <div id="side_menu">
                            <Button icon="pi pi-exclamation-circle" className="p-button-rounded p-button-info p-button-text" tooltip={"Warnings"} style={{ color: this.myColor(0) }} onClick={() => this.setState({ selectedTab: 0 })} />
                            <Button icon="pi pi-th-large" className="p-button-rounded p-button-info p-button-text" tooltip={"Packages"} style={{ color: this.myColor(1) }} onClick={() => this.setState({ selectedTab: 1 })} />
                            <Button icon="pi pi-folder" className="p-button-rounded p-button-info p-button-text" tooltip={"Files"} style={{ color: this.myColor(2) }} onClick={() => this.setState({ selectedTab: 2 })} />
                        </div>
                        <div className={this.state.selectedTab == 2 ? 'active' : 'unactive'}>
                            <FileTree data={this.state} />  {/*To maintain the tree state */}
                        </div>
                        {activeArea}
                    </div>
                </>) : (<div className="app">
                <Card title="Loading Results..." style={{ display: 'inline-block', marginTop: '15%', zIndex: 10}}>
                    <ProgressBar mode="indeterminate" style={{ height: '15px'}}></ProgressBar>
                    {emailArea}                
                   
                </Card>
                </div>)}

            </div>
        );
    }
}
export default Git;