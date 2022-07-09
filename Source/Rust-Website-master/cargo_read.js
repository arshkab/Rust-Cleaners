/*function read_output(){
    var data = JSON.parse();
}*/

/*$.getJSON("final_output.json", function(json) {
    console.log(json); // this will show the info it in firebug console
});*/

//Passed the file name by command line.

const glob = require('glob');
const path = require('path');
const fs = require('fs');

const split_Files = glob.sync("./downloads/rc_cargo_audit_results/" + '*.json');

console.log(split_Files);

var vulnerabilities = [];

for(var file = 0; file < split_Files.length; file++){

	var jsonData = require(split_Files[file]);
	console.log(jsonData.vulnerabilities.list.length);
	for(var i=0;i<jsonData.vulnerabilities.list.length;i++){
		if (vulnerabilities.find(element => element == jsonData.vulnerabilities.list[i].advisory.description) == undefined){
			vulnerabilities[vulnerabilities.length] = jsonData.vulnerabilities.list[i].advisory.description;
			console.log("NextTool:");
			console.log("Crate: ",jsonData.vulnerabilities.list[i].advisory.package);
			console.log("Version: ",jsonData.vulnerabilities.list[i].advisory.package.version);
			console.log("Date: ",jsonData.vulnerabilities.list[i].advisory.date);
			console.log("Title: ",jsonData.vulnerabilities.list[i].advisory.title);
			console.log("ID: ",jsonData.vulnerabilities.list[i].advisory.id);
			console.log("URL: ",jsonData.vulnerabilities.list[i].advisory.url);
			console.log("Description: ",jsonData.vulnerabilities.list[i].advisory.description);
			console.log("\n");
			if(jsonData.vulnerabilities.list[i].versions.patched.length != 0){
				console.log("Solution:");
				var str = "Upgrade to ";
				for(var j=0;j<jsonData.vulnerabilities.list[i].versions.patched.length;j++){
				   str += jsonData.vulnerabilities.list[i].versions.patched[j] + ', ';
				}
			
				console.log(str.slice(0, str.length - 2));
			}
			else{
				console.log("There are no safe upgrades available.");
			}
		}
	}

}
