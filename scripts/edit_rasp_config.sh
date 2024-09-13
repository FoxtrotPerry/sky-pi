#!/bin/bash

# This is necessary for the pi to talk to the eink HAT.
# More info: https://github.com/pimoroni/inky/issues/202

# If not using Bookworm, config is located at /boot/config.txt
CONFIG_FILE="/boot/firmware/config.txt"

# The line you want to add
LINE="dtoverlay=spi0-0cs"

# Add SPI option to the raspberry pi's config file if it doesn't already exist
if ! grep -q "^${LINE}$" "$CONFIG_FILE"; then
    echo "$LINE" | tee -a "$CONFIG_FILE" > /dev/null
    echo "Line added: $LINE"
fi
