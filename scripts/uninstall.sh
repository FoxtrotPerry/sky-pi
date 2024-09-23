#!/bin/bash

bold=$(tput bold)
normal=$(tput sgr0)
green=$(tput setaf 2)
yellow=$(tput setaf 3)
red=$(tput setaf 1)
magenta=$(tput setaf 5)
cyan=$(tput setaf 6)

info_echo() {
  local message="$1"
  echo "🌪️ ${bold}[INFO]${normal}: $message"
}

done_echo() {
  local message="$1"
  echo "✨ ${bold}${green}[DONE]: $message${normal} ✨"
}

SKYPI_DIR="$HOME/.sky-pi"
BROWSER_CACHE="$HOME/.cache/puppeteer"

echo "🌓 ${bold}${magenta}SKY PI Removal${normal} 🌗"

info_echo "Removing crontab entries..."
bash $SKYPI_DIR/sky-pi/rm_crontab.sh

info_echo "Removing project files..."
rm -rf $SKYPI_DIR

info_echo "Removing headless browser cache..."
rm -rf $BROWSER_CACHE

done_echo "SKY PI removal complete!"
