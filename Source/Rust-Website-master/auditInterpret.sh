parent_folder="$(dirname "$CARGO_AUDIT_OUTPUT_FILES")"
SAVE_DIR=$PWD/downloads/rc_cargo_audit_results

node cargo_read.js
