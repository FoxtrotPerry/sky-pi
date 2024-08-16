#!/bin/bash

SKYPI_DIR="$HOME/.sky-pi"

# write out current crontab config
crontab -l > tmp_crontab
# echo screenshot crontab entry into temp file
echo "*/15 * * * * node $SKYPI_DIR/sky-pi/screenshot/screenshot.js" >> tmp_crontab
# echo eink_draw crontab entry into temp file
# TODO: ADD EINK DRAW CRONTAB ENTRY HERE
# install new cron file
crontab tmp_crontab
rm tmp_crontab
