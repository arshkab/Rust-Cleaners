#!/bin/bash


#NEED TO FIX CD BACK AFTER COMMAND IS RUN - done, but needs to be tested
#NEED TO FIX CREATING NEW FILES - not needed


#remove cloned repo from workspace (otherwise cargo audit doesn't work)
#sed 's/exclude = \["enums"/&, "simple-solana-program"/' ../Cargo.toml -i

#finds where Cargo.lock is and then cuts Cargo.lock in order to run cargo audit on the toml file
CARGO_FILES=$(find downloads/ -name "*Cargo.lock" | rev | cut -c11- | rev | tr -d '\r')
SAVE_DIR=$PWD/downloads/rc_cargo_audit_results
mkdir -p -- "$SAVE_DIR" # make directory to save all files in

#cargo geiger on toml files
#echo $CARGO_FILES
#goes through Cargo.toml files and runs cargo audit
I=0
for f in $CARGO_FILES
    do
        echo $f
        #echo "Cargo Audit Output"
        cd $f
		cargo audit -n -q --json > $SAVE_DIR/cargo_audit_output$I.json

        #extends output json to include the directory it was run on
        # sed -i '1i {\n"directory": "'"$f"'",\n"output":' $SAVE_DIR/cargo_audit_output$I.json
        # sed -i -e '$a}' $SAVE_DIR/cargo_audit_output$I.json
        (( I++ ))
        #echo "Cargo Geiger Output"
        #cargo geiger
        
        #echo "--------------"
        cd -
done
