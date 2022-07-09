#finds where Cargo.lock is and then cuts Cargo.lock in order to run cargo audit on the toml file
CARGO_FILES=$(find downloads/ -name "*Cargo.lock" | rev | cut -c11- | rev | tr -d '\r')
SAVE_DIR=$PWD/downloads/rc_cargo_mirai_results
mkdir -p -- "$SAVE_DIR" # make directory to save all files in

#cargo geiger on toml files
echo $CARGO_FILES
echo $SAVE_DIR
#goes through Cargo.toml files and runs cargo audit
I=0
for f in $CARGO_FILES
    do
        echo $f
        #echo "Cargo Audit Output"
        cd $f
		cargo mirai -q 2> $SAVE_DIR/cargo_mirai_output$I.txt
       
        #extends output json to include the directory it was run on
        # sed -i '1i {\n"directory": "'"$f"'",\n"output":' $SAVE_DIR/cargo_audit_output$I.json
        # sed -i -e '$a}' $SAVE_DIR/cargo_audit_output$I.json
        (( I++ ))
        cd -
done
