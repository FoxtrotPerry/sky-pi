#!/bin/bash

SKYPI_DIR="$HOME/.sky-pi"

# write out current crontab config
crontab -l > tmp_crontab
# echo screenshot and draw entry into temp file
# Why we need to use bash specifically: https://askubuntu.com/a/752245
echo "*/15 * * * * node $SKYPI_DIR/sky-pi/screenshot/screenshot.js && bash -c '$SKYPI_DIR/sky-pi/actions/draw.sh'" >> tmp_crontab
# Refresh the display every 12 hours (at midnight and noon)
echo "0 */12 * * * bash -c '$SKYPI_DIR/sky-pi/actions/refresh.sh'" >> tmp_crontab
# echo app startup entry into temp file
echo "@reboot bash -c '$SKYPI_DIR/sky-pi/actions/start.sh'" >> tmp_crontab
# install new cron file
crontab tmp_crontab
rm tmp_crontab
