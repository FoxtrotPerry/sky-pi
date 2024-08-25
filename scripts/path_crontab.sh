#!/bin/bash

SKYPI_DIR="$HOME/.sky-pi"

touch tmp_crontab
# echo PATH into config
echo "PATH=$PATH" >> tmp_crontab
# write out current crontab config
crontab -l >> tmp_crontab
# install new cron file
crontab tmp_crontab
rm tmp_crontab