//Needs to find the correct directory which is the src folder: not done yet 

//Passed the file name by command line.

const path = require('path');
const fs = require('fs');

// Somewhat complex function for combining overlapping file paths
// If given /downloads/src/bin and /src/bin/testfile.rs
// Will return /downloads/src/bin/testfile.rs
function pathfinder(left, right) {
	// turn the two paths into path variables and split them on the backslashes
	path1 = path.normalize(left);
	path2 = path.normalize(right);
	var arrOfPath1 = [...path1.split('\\')];
	var arrOfPath2 = [...path2.split('\\')];
	
	// find the overlap between them and slice off of the left side
	var overlap = arrOfPath1.findIndex(element => element == arrOfPath2[0]);
	arrOfPath1 = arrOfPath1.slice(0,overlap);
	
	// concatenate and join
	var arrOfDirectories = arrOfPath1.concat(arrOfPath2);
	var jankyPath = arrOfDirectories.join('/');
	
	// normalize for good formatting
	var currPath = path.normalize(jankyPath);
	return currPath;
}




// get the directory from command line
const myArgs = process.argv.slice(2);

// open the data file
const jsonData = require(myArgs[0] + "/clippy_output.json");
var splitJson = [];

// for each "result"...
for(var i = 0; i < jsonData.runs[0].results.length; i++){
	
	// check if we have had a result from this file already
	var newFile = true;
	for (var j = 0; j < splitJson.length; j++) {
	
		// if we have seen this file, append to that file's space in the list
		if (splitJson[j][0] == jsonData.runs[0].results[i].locations[0].physicalLocation.artifactLocation.uri){
			splitJson[j][splitJson[j].length] = jsonData.runs[0].results[i];
			// set flag down and break loop
			newFile = false;
			break;
		}
	}
	
	// if we haven't seen this file, make a new section in the array and start it with the filename
	if (newFile){
		splitJson[splitJson.length] = [jsonData.runs[0].results[i].locations[0].physicalLocation.artifactLocation.uri, jsonData.runs[0].results[i]];
	}
    
	
}

// for every file
for(var i = 0; i < splitJson.length; i++){
	
	// find the path to save to with the functino made earlier
	var currPath = pathfinder(myArgs[0], splitJson[i][0]);
	
	// save all of the JSON data to this log file
	fs.writeFile(currPath + ".json", JSON.stringify({results: splitJson[i].slice(1)}), 'utf8', function(err) {
		if (err) throw err;
		}
	);

}


