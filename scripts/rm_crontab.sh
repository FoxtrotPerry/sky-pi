#!/bin/bash

# write out current crontab config
crontab -l > curr_crontab
# create clone of crontab config "new_crontab" that has all lines
# mentioning "sky-pi" removed
grep -v "sky-pi" curr_crontab > new_crontab
# install new cron file
crontab new_crontab
# delete tmp files
rm curr_crontab
rm old_crontab
