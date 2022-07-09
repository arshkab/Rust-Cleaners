parent_folder="$(dirname "$CARGO_MIRAI_OUTPUT_FILES")"
SAVE_DIR=$PWD/downloads/rc_cargo_mirai_results

node miraiRead.js > $SAVE_DIR/cargo_mirai_output$I.json

