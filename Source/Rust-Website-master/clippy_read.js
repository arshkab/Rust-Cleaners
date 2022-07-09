//Needs to find the correct directory which is the src folder: not done yet 

//Passed the file name by command line.

const myArgs = process.argv.slice(2);

const jsonData = require(myArgs[0]);
for(var i=0;i<jsonData.runs[0].results.length;i++){
    console.log("NextTool:")
    console.log("File : ",jsonData.runs[0].results[i].locations[0].physicalLocation.artifactLocation.uri);
    console.log("Severity Level : ",jsonData.runs[0].results[i].level);
    console.log("Line : ",jsonData.runs[0].results[i].locations[0].physicalLocation.region.startLine);
    console.log("Error Message : ",jsonData.runs[0].results[i].message.text);
    console.log('\n');
}
