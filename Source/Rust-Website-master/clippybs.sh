#!/bin/bash

RUST_FILES=$(find -name "*.rs" -path "*downloads/*")

directory_list=()

#Runs rust-code-analysis and cargo clippy tool on every rs file found

for f in $RUST_FILES
    do

        #This command prints metrics
        #echo "Rust-code-analysis Output"
        #cargo run -p rust-code-analysis-cli -- -m -p $fs
        #Finds the parent folder to call the clippy command

        parentnames="$(dirname "$f")"
        directory_list+=($parentnames)
done

#Removes redundant parent folders

sorted_array=( $(printf "%s\n" "${directory_list[@]}" | sort | uniq) ) 
#echo ${sorted_array[@]}


for j in ${sorted_array[@]}
    do
        #Runs clippy on parent folders
        cd $j
        cargo clippy -q --message-format=json | clippy-sarif > clippy_output.json
        # finds number of backslashes to determine how many directories to go back to
        #number_of_directories=($(echo $j | tr -cd '/' | wc -c))
        #echo $number_of_directories
        #while [ $number_of_directories -ne 0 ]
        #    do
        #        cd ..
        #        #pwd
        #        number_of_directories=$(( $number_of_directories - 1 ))
        #    done
       
		# undoes the last cd commant.
		cd -
		node clippy_split.js $j
done
node clippy_join.js