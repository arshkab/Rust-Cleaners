const glob = require('glob');
const path = require('path');
const fs = require('fs');


var split_Files = [];

split_Files = glob.sync("./downloads" + '/**/*.rs.json');

console.log(split_Files);

var info = [];

for (var i = 0; i < split_Files.length; i++) {
	info[i] = {
		"filename": {},
		"data": {}
		};
	file = split_Files[i];
	info[i].filename = file.replace(".json", "");
	info[i].data = require(split_Files[i]);
}

fs.writeFile("./downloads/clippy.json", JSON.stringify(info), 'utf8', function(err) {
	if (err) throw err;
	}
);
console.log(info);
