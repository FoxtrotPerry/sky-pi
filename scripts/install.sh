#!/bin/bash

bold=$(tput bold)
normal=$(tput sgr0)
green=$(tput setaf 2)
yellow=$(tput setaf 3)
red=$(tput setaf 1)
magenta=$(tput setaf 5)
cyan=$(tput setaf 6)

SKYPI_DIR="$HOME/.sky-pi/"
ZIP_FILE="sky-pi.zip"

ask_echo() {
  local message="$1"
  echo "❔ ${cyan}[PERMISSION]: $message${normal}"
}

info_echo() {
  local message="$1"
  echo "⛅️ ${bold}[INFO]${normal}: $message"
}

error_echo() {
  local message="$1"
  echo "❌ ${bold}${red}[ERROR]${normal}${red}: $message${normal}" >&2
}

success_echo() {
  local message="$1"
  echo "✅ ${bold}[SUCCESS]: $message${normal}"
}

clear

echo "🌓 ${bold}${magenta}SKY PI Installation${normal} 🌗"
printf "\n"

info_echo "Making sky-pi directory at $SKYPI_DIR..."
mkdir -p $SKYPI_DIR
cd $SKYPI_DIR

info_echo "Downloading latest sky-pi distribution..."
wget -q --show-progress --progress=bar https://github.com/foxtrotperry/sky-pi/releases/latest/download/$ZIP_FILE

if [ ! -f "$ZIP_FILE" ]; then
  error_echo "sky-pi distribution download failed"
  exit 1
fi

info_echo "Un-zipping sky-pi zip..."
unzip -qq $ZIP_FILE

if [ ! -d "$SKYPI_DIR" ]; then
  error_echo "sky-pi distribution failed to unzip"
  exit 1
fi

chmod +x $SKYPI_DIR/sky-pi/*.sh
chmod +x $SKYPI_DIR/sky-pi/actions/*.sh

info_echo "Cleaning up artifacts..."
rm $ZIP_FILE

info_echo "Running Setup script..."
printf "\n"

bash $SKYPI_DIR/sky-pi/setup.sh
