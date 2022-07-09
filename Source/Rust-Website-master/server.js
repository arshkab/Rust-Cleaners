const express = require('express');
const app = express(); 
const port = process.env.PORT || 8080; //set port
const clone = require('git-clone');
const fs = require('fs');
const fse = require('fs-extra');
const dree = require('dree');
const extract = require('extract-zip');
const path = require('path');
const XMLHttpRequest = require('xhr2');
const AWS = require('aws-sdk');
const bodyParser = require('body-parser');
const { nanoid } = require('nanoid');

const uploadDir = path.join(__dirname, '/downloads/');
let filePath = '';
let awsConfig = {
	region: "us-east-1",
	endpoint: "http://dynamodb.us-east-1.amazonaws.com"
};
AWS.config.update(awsConfig);
var docClient = new AWS.DynamoDB.DocumentClient();
const { execSync, spawnSync } = require("child_process");
const { resolve } = require('path');

const toolToLocation = {
	"Clippy": "./downloads/clippy.json",
	"Cargo Audit": "./downloads/rc_cargo_audit_results/cargo_audit_output0.json",
    "Mirai": "./downloads/rc_cargo_mirai_results/cargo_mirai_output0.json"
};

// Run the backend with "node server.js" in the root directory

app.use(express.json({extended: false}));

// path to the built front-end, allows the entire app to run with only a call to the server.
app.use(express.static(path.join(__dirname, 'build')));

// Sets the CORS permissions for the app
// Currently allows post requests from everywhere
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*"); // allow requests from the frontend
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

// This displays message that the server running and listening to specified port
app.listen(port, () => console.log(`Listening on port ${port}`)); // Listen at 5000

// Base get function if the base url is serverd a get request.
// Mostly here to test connectivity
app.get('/', (req, res) => {
	res.send({ express: 'Base GET' }); // debug reply function
});

// create a GET route
app.get('/express_backend', (req, res) => {
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' }); // debug reply function
});

// cleans the download directory and clones the given repo
// awaits make the program run sequentially
// returns a promise once the clone is complete
async function cleanAndClone(url, commit) {
	await fse.emptyDir("./downloads");
	await fse.emptyDir("./public/data");
	await fse.emptyDir("./build/data");
		return new Promise((resolve, reject) => {
			clone(url, "./downloads", {checkout: commit}, () => {
				resolve();
			});
		});
}

function dirTree(filename, thisIndex) {
    var stats = fs.lstatSync(filename),
        info = {
					key: thisIndex,
					label: path.basename(filename),
					data : "",
					icon : "pi pi-fw pi-cog"
        };

    if (stats.isDirectory()) {
        info.data = "folder";
        info.children = fs.readdirSync(filename).map(function(child, index) {
            return dirTree(filename + '/' + child, thisIndex + "-" + index);
        });
    } else {
        // Assuming it's a file. In real life it could be a symlink or
        // something else!
        info.data = "file";
				info.icon = "pi pi-fw pi-file";
    }

    return info;
}
/* File upload area
* Source: https://stackoverflow.com/questions/61457936/how-can-i-upload-a-zip-file-using-nodejs-and-extract-it
 */
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
//Unzip files

fse.emptyDir("./downloads"); //Set conidition if dir isn't already made
app.post('/upload', (req, res) => {
	let file = req.body;
	fs.writeFile('./downloads/' + file.fileName, file.data, "base64", function (err) {
		if (err) {
			console.log(err);
		}
		else {
			console.log("file downoaded, waiting on extraction");
		}
	});


	res.send("'finished':'done'");

});

async function extractZip(source, target) {
	try {
		await extract(source, { dir: target });
		console.log("Extraction complete");
	} catch (err) {
		console.log("ExtractZip failed:", err);
	}
}

// When submit is pressed, generate an ID that can be used for email
app.post('/submit', (req, res) => {
	var url = req.body.repo; // save the url for use soon
	var tools = req.body.tools;
	var branch = "";
	var repoData = ["", ""]; // repo owner [0] and name [1]
	var inURL = false;

	//TODO: Add this functionality to file uploads?
	if (!url.includes('github') && url.length == 21) {
		inURL = true;
		res.send({'id': url});
	}

	// Check if URL indicates the branch
	if (!inURL) {
		var treeIdx = url.indexOf('/tree/');
		if (treeIdx !== -1) {
			branch = url.substring(treeIdx + '/tree/'.length);
			url = url.substring(0, treeIdx);
		}
		repoData = url.substring(url.indexOf('github.com/') + 'github.com/'.length).split('/');
		console.log("Given URL: " + req.body.repo); //Log the current url

		// Find commit ID
		requestCommit(repoData[0], repoData[1], branch, async function (sha) {
			// Add submission to database
			saveSubmission(tools, repoData, sha, url).then((id) => {
				res.send({'id': id});
			});
		});
	}
});

app.post('/filesubmit', (req, res) => {
	let tools = req.body.tools;
	let FileName = req.body.Filename;
	let toSend = 'none';
	let dirName = FileName.toString().slice(0,-4);
	console.log(dirName);
	var tree;
	var treeStr;
	// Create directory tree

	extractZip(uploadDir+FileName, uploadDir).then( () =>{
		tree = dirTree('./downloads/'+dirName, '0'),
		treeStr = JSON.stringify(tree),
		fs.writeFileSync('./build/data/treenodes.json', treeStr, err => {
			if (err) {
				console.error(err);
				return;
			}
		}),
		fs.writeFileSync('./public/data/treenodes.json', treeStr, err => {
			if (err) {
				console.error(err);
				return;
			}
			// success
			console.log("Directory tree written to treenodes.json");
		}),
			//Runs script that has the tools
			//
			//process.chdir('./downloads/'+dirName),
			console.log("Tools:", tools)
			if (tools.includes('Clippy')) {
				console.log('Running Clippy');
				const stdout = execSync("bash clippybs.sh");
				console.log('Clippy done');
			}
			if (tools.includes('Cargo Audit')) {
				console.log('Running Cargo Audit');
				const stdout = execSync("bash auditBsh.sh");
				console.log('Cargo Audit done');
	
				//Runs script that interpets the output files from cargo audit
				console.log('Running Script2');
				const stdout2 = execSync("bash auditInterpret.sh");
				toSend = stdout2.toString();
				console.log('Script2 worked');
			}
			//Sends cargo audit output if it was ran
			res.send({ 'output': toSend })
	}).catch( err =>
				console.log(err),
				res.send({ 'Output': 'ERROR' }), //Reply with ERROR
		);

});

app.post('/github', (req, res) => { // when a post is received to this url, it must be a github upload
	var submissionID = req.body.id;

	// Get repo/tools used from DB
	searchSubmission(submissionID).then(async (infoArr) => {
		let repoData = infoArr[0].split("/");
		let tools = infoArr[1];
		let commit = infoArr[2];
		let url = infoArr[3];

		// Check if result is cached
		let hasTools = false;
		let cacheJson = "";
		let toolIdxs = [];
		let resultsSearched = searchResults(repoData, commit).then((data) => {
			cacheJson = data;
			if (data.hasOwnProperty('Item')) {
				// Check if cache has all the tools they want to run (if so, hasTools is now true)
				var allNames = data.Item.toolOutputs.map(obj => obj.name);
				for (var i = 0; i < tools.length; i++) {
					let idx = allNames.indexOf(tools[i]);
					if (idx === -1) {
						break;
					}
					else if (i === tools.length - 1) {
						hasTools = true;
					}
					toolIdxs.push(idx);
				}
			}
		});

		// Download Git repo
		try {
			await cleanAndClone(url, commit);
			fs.rmSync('./downloads/.git', { recursive: true, force: true });
			console.log('Clone complete');
		} catch {
			console.log('Clone Error!');
		}
		
		// Create directory tree
		var tree = dirTree('./downloads', '0');

		var treeStr = JSON.stringify(tree);
		fs.writeFileSync('./build/data/treenodes.json', treeStr, err => {
			if (err) {
				console.error(err);
				return;
			}
		})
		fs.writeFileSync('./public/data/treenodes.json', treeStr, err => {
			if (err) {
				console.error(err);
				return;
			}
			// success
			console.log("Directory tree written to treenodes.json");
		})

		// Run code analysis script if not cached
		let toSend = 'none';
		await resultsSearched; // Wait to check if cached
		if (hasTools) {
			// Recreate results files
			if (!fs.existsSync(toolToLocation['Cargo Audit'].substring(0, toolToLocation['Cargo Audit'].lastIndexOf('/')))){
				fs.mkdirSync(toolToLocation['Cargo Audit'].substring(0, toolToLocation['Cargo Audit'].lastIndexOf('/')));
			}
			if (!fs.existsSync(toolToLocation['Mirai'].substring(0, toolToLocation['Mirai'].lastIndexOf('/')))){
				fs.mkdirSync(toolToLocation['Mirai'].substring(0, toolToLocation['Mirai'].lastIndexOf('/')));
			}
			for (var i = 0; i < tools.length; i++) {
				fs.writeFileSync(toolToLocation[tools[i]], JSON.stringify(cacheJson.Item.toolOutputs[toolIdxs[i]].output));

				if (tools[i] == 'Cargo Audit') {
					//Runs script that interpets the output files from cargo audit
					console.log('Running Script2');
					const stdout2 = execSync("bash auditInterpret.sh");
					toSend = stdout2.toString();
					console.log('Script2 worked');
				}

				if (tools[i] == 'Mirai') {
					//Runs script that interpets the output files from cargo audit
					console.log('Running Script2');
					const stdout2 = execSync("bash miraiInterpret.sh");
					toSend = stdout2.toString();
					console.log('Script2 worked');
				}
			}
			console.log("All data retrieved from DB");
			res.send({'output': toSend});
		}
		else {
			try {
				//Runs script that has the tools
				console.log("Tools:", tools);
				if (tools.includes('Clippy')) {
					console.log('Running Clippy');
					const stdout = execSync("bash clippybs.sh");
					console.log('Clippy done');
				}
				if (tools.includes('Cargo Audit')) {
					console.log('Running Cargo Audit');
					const stdout = execSync("bash auditBsh.sh");
					console.log('Cargo Audit done');

					//Runs script that interpets the output files from cargo audit
					console.log('Running Script2');
					const stdout2 = execSync("bash auditInterpret.sh");
					toSend = stdout2.toString();
					console.log('Script2 worked');
				}

        if(tools.includes('Mirai')){
					console.log('Running Mirai');
					const stdout = execSync("bash miraiBsh.sh");
					console.log('Mirai done');

					console.log('Running Script2');
					const stdout2 = execSync("bash miraiInterpret.sh");
					toSend = stdout2.toString();
					console.log(toSend);
					console.log('Script2 worked');
				}
				//Sends cargo audit output if it was ran
				res.send({'output': toSend});
				//Sends to DB
				outputToDB(tools, repoData, commit);
			}
			catch {
				console.log('Bash Error!');
				res.send({'Output' : 'ERROR'}); //Reply with ERROR
			}
		}
	});
});

// Return local file contents
app.post('/localfile', (req, res) => {
	var dir = req.body.fileDir;

	fs.readFile(dir, 'utf8' , (err, data) => {
		if (err) {
			console.error(err);
			return;
		}
		res.send({'Output' : data, 'filename' : dir});
	});
});

// Return most recent commit ID
function requestCommit(owner, repo, branch, callback) {
	// If the URL includes a cached ID, do nothing
	if (owner === "" && repo === "") {
		callback("");
	}
	else {
		let br = branch;
		if (br === "") {
			const xhr = new XMLHttpRequest();
			const url = `https://api.github.com/repos/${owner}/${repo}`;
			xhr.open('GET', url, true);

			xhr.onload = function() {
				const data = JSON.parse(this.response);
				br = data.default_branch;

				const xhr = new XMLHttpRequest();
				const url = `https://api.github.com/repos/${owner}/${repo}/commits/${br}`;
				xhr.open('GET', url, true);
			
				xhr.onload = function() {
					const data = JSON.parse(this.response);
					callback(data.sha);
				}
				xhr.send();
			}
			xhr.send();
		}
		else {
			const xhr = new XMLHttpRequest();
				const url = `https://api.github.com/repos/${owner}/${repo}/commits/${br}`;
				xhr.open('GET', url, true);
			
				xhr.onload = function() {
					const data = JSON.parse(this.response);
					callback(data.sha);
				}
				xhr.send();
		}
	}
}

function searchResults(repoData, commit) {
	var params = {
		TableName: "analysisResults",
		Key: {
			"gitRepo": repoData[0] + "/" + repoData[1],
			"commitID": commit
		}
	};
	return new Promise((resolve, reject) => {
		docClient.get(params, function(err, data) {
			if (err) {
				console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
				reject();
			}
			else {
				resolve(data);
			}
		});
	});
}

function searchSubmission(url) {
	var params = {
		TableName: "submitHistory",
		Key: {
			"id": url
		}
	};
	return new Promise((resolve, reject) => {
		docClient.get(params, function(err, data) {
			if (err) {
				console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
				reject();
			}
			else {
				console.log("ITEM", data);
				resolve([data.Item.gitRepo, data.Item.tools, data.Item.commitID, data.Item.url]);
			}
		});
	});
}

function saveSubmission(tools, repoData, sha, url) {
	var newID = nanoid();
	var input = {
		"id": newID,
		"url": url,
		"gitRepo": repoData[0] + "/" + repoData[1],
		"commitID": sha,
		"tools": tools
	};
	var params = {
		TableName: "submitHistory",
		Item: input
	};

	return new Promise((resolve, reject) => {
		docClient.put(params, function (err, data) {
			if (err) {
				console.log("DB error - " + JSON.stringify(err, null, 2));
				reject();
			} else {
				console.log("Saved submission to DB");
				resolve(newID)
			}
		});
	});
}

// Get all tool outputs and sends the data to DynamoDB
function outputToDB(tools, repoData, sha) {
	let toolOutputs = [];

	var promiseClippyResolve, promiseClippyReject;
	var promiseClippy = new Promise(function(resolve, reject){
		promiseClippyResolve = resolve;
		promiseClippyReject = reject;
	});
	
	var promiseAuditResolve, promiseAuditReject;
	var promiseAudit = new Promise(function(resolve, reject){
		promiseAuditResolve = resolve;
		promiseAuditReject = reject;
	});

    var promiseMiraiResolve, promiseMiraiReject;
	var promiseMirai = new Promise(function(resolve, reject){
		promiseMiraiResolve = resolve;
		promiseMiraiReject = reject;
	});
	

	// Get analysis tool data
	if (tools.includes('Clippy')) {
		fs.readFile(toolToLocation['Clippy'], "utf8", (err, jsonString) => {
			if (err) {
				console.log("File read failed:", err);
				promiseClippyReject();
				return;
			}
			toolOutputs.push({
				"name": "Clippy",
				"output": JSON.parse(jsonString)
			});
			promiseClippyResolve();
		});
	}
	else {
		promiseClippyResolve();
	}

    if (tools.includes('Mirai')) {
		fs.readFile(toolToLocation['Mirai'], "utf8", (err, jsonString) => {
			if (err) {
				console.log("File read failed:", err);
				promiseMiraiReject();
				return;
			}
			toolOutputs.push({
				"name": "Mirai",
				"output": JSON.parse(jsonString)
			});
			promiseMiraiResolve();
		});
	}
	else {
		promiseMiraiResolve();
	}

	if (tools.includes('Cargo Audit')) {
		fs.readFile(toolToLocation['Cargo Audit'], "utf8", (err, jsonString) => {
			if (err) {
				console.log("File read failed:", err);
				promiseAuditReject();
				return;
			}
			toolOutputs.push({
				"name": "Cargo Audit",
				"output": JSON.parse(jsonString)
			});
			promiseAuditResolve();
		});
	}
	else {
		promiseAuditResolve();
	}

	// Save output to DynamoDB
	let save = async function () {
		// Wait for file read json for each tool
		await promiseClippy;
		await promiseAudit;
        await promiseMirai;
		console.log("we are done with file read, time to save !");

		var input = {
			"gitRepo": repoData[0] + "/" + repoData[1],
			"commitID": sha,
			toolOutputs
		};
		var params = {
			TableName: "analysisResults",
			Item: input
		};
		docClient.put(params, function (err, data) {
			if (err) {
				console.log("DB error - " + JSON.stringify(err, null, 2));
			} else {
				console.log("Saved tool output to DB");
			}
		});
	}
	save();
}
