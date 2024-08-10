#!/bin/bash

SKYPI_DIR="$HOME/.sky-pi"

#write out current crontab
crontab -l > mycron
#echo new cron into cron file
echo "*/15 * * * * node $SKYPI_DIR/sky-pi/screenshot/screenshot.js" >> mycron
#install new cron file
crontab mycron
rm mycron
