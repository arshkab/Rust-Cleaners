
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const { isParameter } = require('typescript');

const split_Files = glob.sync("./downloads/rc_cargo_mirai_results/" + '*.txt');


var vulnerabilities = [];
//var data = require(split_Files[0]);
for(var file = 0; file < split_Files.length; file++){
    fs.readFile(split_Files[file], 'utf8', (err, data) =>{
        if (err) {
            console.error(err)
            return
        }
    
        var arr = data.toString().replace(/\r\n/g,'\n').split('\n');
        arr = [... new Set(arr)]
        console.log(arr);
        var list = [];
        var b = {};
        var counter = 0;
        var a = "error";
        for(let i of arr){
            if(i.includes('-->')){
                counter = counter + 1;
                var lists = [];
                list.push(lists);
               
            }

        }

        var counter1 = 0;
        for(let i of arr) {
            if(i.includes('warning')){
                //var temp = dict[counter1];
                list[counter1].push({
                    "key": i
                });
                
            

            }
            else if(i.includes('-->')){
                var lineNumber = i.substring(
                    i.indexOf(":") + 1, 
                    i.lastIndexOf(":")
                );
                list[counter1].push({
                    "lineNumbers": lineNumber
                });
                counter1 = counter1 + 1;
                if(counter1 == counter){
                    break;
                }
            }
            
        
            
        }
        var dicter = {};
        for(var i in list){
           
            dicter["error"+i] = list[i];
        }
        let json = JSON.stringify(dicter);
        console.log(json);

       
    })
}
