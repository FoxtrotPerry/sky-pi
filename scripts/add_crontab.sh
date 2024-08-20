#!/bin/bash

SKYPI_DIR="$HOME/.sky-pi"

# write out current crontab config
crontab -l > tmp_crontab
# echo screenshot and draw crontab entry into temp file
# Why we need to use bash specifically: https://askubuntu.com/a/752245
echo "*/15 * * * * node $SKYPI_DIR/sky-pi/screenshot/screenshot.js && bash -c '$SKYPI_DIR/sky-pi/actions/draw.sh'" >> tmp_crontab
# install new cron file
crontab tmp_crontab
rm tmp_crontab
