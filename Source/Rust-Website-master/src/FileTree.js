// Followed https://primefaces.org/primereact/tree/ tutorial

import React, { Component } from 'react';
import { Tree } from 'primereact/tree';
import { Tooltip } from 'primereact/tooltip';
import { NodeService } from './service/NodeService';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import './body.css';

const fileExtensionToLanguage = { // If not in here, will try to use the file extension as language
    "rs": "rust",
    "sh": "shell",
    "cxx": "cpp",
    "cc": "cpp",
    "js": "javascript",
    "make": "makefile",
    "py": "python",
    "md": "markdown"
  };

export class FileTree extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nodes: null,
            expandedKeys: {},
            selectedKey: null,
            code: null,
			warnings: {},
			highlights: [0],
			messages: ["Test Message"]
        };

        this.nodeService = new NodeService();
        this.expandNode = this.expandNode.bind(this);
        this.onNodeSelect = this.onNodeSelect.bind(this);
        this.onNodeUnselect = this.onNodeUnselect.bind(this);
    }
	
    // A function is used for dragging and moving (https://stackoverflow.com/questions/12194469/best-way-to-do-a-split-pane-in-html)
    dragElement(element, direction) {
        var   md; // remember mouse down info
        const tree  = document.getElementById("tree");
        const codeblocks = document.getElementById("codeblocks");

        element.onmousedown = onMouseDown;

        function onMouseDown(e) {
            //console.log("mouse down: " + e.clientX);
            md = {e,
                offsetLeft:  element.offsetLeft,
                offsetTop:   element.offsetTop,
                firstWidth:  tree.offsetWidth,
                secondWidth: codeblocks.offsetWidth
                };

            document.onmousemove = onMouseMove;
            document.onmouseup = () => {
                //console.log("mouse up");
                document.onmousemove = document.onmouseup = null;
            }
        }

        function onMouseMove(e) {
            //console.log("mouse move: " + e.clientX);
            var delta = {x: e.clientX - md.e.clientX,
                        y: e.clientY - md.e.clientY};

            if (direction === "H" ) { // Horizontal
                // Prevent negative-sized elements
                delta.x = Math.min(Math.max(delta.x, -md.firstWidth),
                        md.secondWidth);

                element.style.left = md.offsetLeft + delta.x + "px";
                tree.style.width = (md.firstWidth + delta.x) + "px";
                codeblocks.style.width = (md.secondWidth - delta.x) + "px";
            }
        }
    }

    expandNode(node, expandedKeys) {
        if (node.children && node.children.length) {
            expandedKeys[node.key] = true;

            for (let child of node.children) {
                this.expandNode(child, expandedKeys);
            }
        }
    }
	
	// Highlight the code
	highlighter(directory) {
		//fetch the warnings and start the arrays
		console.log(directory);
		let warnings = this.state.warnings;
		let to_highlight = [];
		let to_message = [];
		for (let j = 0; j < warnings.length; j++){
			console.log(warnings[j].filename);
			console.log(directory);
			if (warnings[j].filename === directory) {
				//for each warning, find the start and end lines and the attached warning message
				for(let i=0; i < warnings[j].data.results.length; i++){ //error
					console.log(warnings[j].data.results[i]);
					let start = warnings[j].data.results[i].locations[0].physicalLocation.region.startLine;
					let end = warnings[j].data.results[i].locations[0].physicalLocation.region.endLine;
					let message = warnings[j].data.results[i].message.text;
					
					//append every line in the range
					for (let x = start; x <= end; x++) {
						to_highlight[to_highlight.length] = x;
						to_message[to_message.length] = message;
					}
				}
			}
		}
		
		// set the states for use later
		this.setState({highlight: to_highlight, messages: to_message});
	}
	
	lock_highlighter(cargo_output) {
		return null;
	}

    componentDidMount() {
        this.dragElement( document.getElementById("separator"), "H" );
        this.nodeService.getTreeNodes().then(data => this.setState({ nodes: data }));
		var serverUrl = window.location.origin; 
		/*if (process.env.AWS_DEFAULT_REGION) {
			serverUrl = process.env.REACT_APP_SERVER_URL;
		}
		else {
			serverUrl = "http://localhost:8080"
			//serverUrl = "rustcleaner.net";
		}*/
	
		// Fetch file content for node clicked on
		fetch(serverUrl + '/localfile', {
			method: 'POST',
			mode: 'cors',
			credentials: 'same-origin',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ 'fileDir': './downloads/clippy.json' })
		}).then((result) => {
			(result.json().then((parsed) => {this.setState({warnings: JSON.parse(parsed.Output)});}));
		});

    }

    onNodeSelect(node) {
        console.log("clicked on", node);
        if (node.node.data === "file") {
            this.nodeService.getFullDirectory(node).then((dir) => {
                console.log("with directory:", dir);

                var serverUrl = window.location.origin;
                /*if (process.env.AWS_DEFAULT_REGION) {
                    serverUrl = process.env.REACT_APP_SERVER_URL;
                }
                else {
                    serverUrl = "http://localhost:8080"
					//serverUrl = "rustcleaner.net";
                }*/
            
                // Fetch file content for node clicked on
                fetch(serverUrl + '/localfile', {
                    method: 'POST',
                    mode: 'cors',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 'fileDir': dir })
                }).then((response) => {
                    response.json().then((result) => {
                        // Determine file language
                        let lang = dir.substring(dir.lastIndexOf(".") + 1);
                        if (lang in fileExtensionToLanguage) {
                            lang = fileExtensionToLanguage[lang];
                        }
						if (lang == "rust") {
							this.highlighter(dir);
						}
                        // Display file
                        this.setState({code: {
                                code: result.Output,
                                language: lang
                            }
                        }, () => console.log("File displayed in:", this.state.code.language));

                        if (result.Output.language == "lock") {
							console.log(this.props.JSONedArray);
							//lock_highlighter(this.props.data.JSONedArray);
						}
                    });
                });
            });
        }
    }

    onNodeUnselect(node) {
        // TODO
    }

    render() {
        return (
            <div className='splitter'>
                <div id="tree">
                    <Tree value={this.state.nodes} selectionMode="single" selectionKeys={this.state.selectedKey} onSelectionChange={e => this.setState({ selectedKey: e.value })} onSelect={this.onNodeSelect} onUnselect={this.onNodeUnselect} style={{borderWidth: 0}}/>
                </div>
                <div id="separator"></div>
                <div id="codeblocks">
                    {this.state.code != null
                        ?
                        <SyntaxHighlighter
                        language={this.state.code.language}
                        style={darcula}
                        showLineNumbers={true}
                        wrapLongLines={true}
                        wrapLines={true}
                        lineProps={(lineNumber) => {
                            // Basic style
                            const style = { display: "block", width: "fit-content" };
							if (Array.isArray(this.state.highlight) && (this.state.highlight).length) {
								// If this line has a warning attached, change the background color and add an onclick
								if ((this.state.highlight).includes(lineNumber)) {
								  style.backgroundColor = 'rgba(255, 204, 0, .40)';
                                  style.cursor = "pointer";
								  const tooltip = "pog";
								  
								  // find the index of the line number and return the message
								  var index = (this.state.highlight).indexOf(lineNumber);
								  var message = (this.state.messages)[index];
								  style.tooltip = message;
								  
								  // return with an alert displaying the alert message
								  return { style, tooltip, 
								  onClick() {
									alert(message);
								  }};
								// else return the default
								}
							}
							return { style };
                        }}
                        >
                        {this.state.code.code}
                        </SyntaxHighlighter>
						: <p className="file-placeholder">Click on a file to see warnings!</p>
					}
					{false //this.state.warnings != null
						?
                        <SyntaxHighlighter
                        // language={this.state.code.language}
                        style={darcula}
                        showLineNumbers={true}
                        wrapLongLines={true}
                        wrapLines={true}
                        >
                        {JSON.stringify(this.state.warnings, null, '\t')}
                        </SyntaxHighlighter>
						: <p></p>
					}
                </div>
            </div>
        )
    }
}
export default FileTree;