#!/bin/bash

# This is necessary for the pi to talk to the eink HAT.
# More info: https://github.com/pimoroni/inky/issues/202

bold=$(tput bold)
normal=$(tput sgr0)
green=$(tput setaf 2)
yellow=$(tput setaf 3)
red=$(tput setaf 1)
magenta=$(tput setaf 5)
cyan=$(tput setaf 6)

info_echo() {
  local message="$1"
  echo "⛅️ ${bold}[INFO]${normal}: $message"
}

ask_echo() {
  local message="$1"
  echo "❔ ${cyan}[CONFIG]: $message${normal}"
}

# If not using Bookworm, config is located at /boot/config.txt
CONFIG_FILE="/boot/firmware/config.txt"

# The line you want to add
LINE="dtoverlay=spi0-0cs"

# Add SPI option to the raspberry pi's config file if it doesn't already exist
if ! grep -q "^${LINE}$" "$CONFIG_FILE"; then
  info_echo "Required config setting not found. Adding..."
  ask_echo "You might be prompted for your password to edit the config file."
  echo "$LINE" | sudo tee -a "$CONFIG_FILE" > /dev/null
  info_echo "Raspberry Pi config updated"
else
  info_echo "Required config setting already exists in $CONFIG_FILE"
fi
