#!/bin/bash

bold=$(tput bold)
normal=$(tput sgr0)
green=$(tput setaf 2)
yellow=$(tput setaf 3)
red=$(tput setaf 1)
magenta=$(tput setaf 5)
cyan=$(tput setaf 6)

# option variables
pre=false

SKYPI_DIR="$HOME/.sky-pi"
ZIP_FILE="sky-pi.zip"

RPI_SOURCE_LIST=/etc/apt/sources.list.d/raspi.list

ask_echo() {
  local message="$1"
  echo "❔ ${cyan}[PERMISSION]: $message${normal}"
}

info_echo() {
  local message="$1"
  echo "⛅️ ${bold}[INFO]${normal}: $message"
}

warn_echo() {
  local message="$1"
  echo "⚠️ ${bold}${yellow}[WARN]${normal}${yellow}: $message${normal}"
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

while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --pre)
      pre=true
      ;;
    *)
      error_echo "Unknown option: $1"
      exit 1
      ;;
  esac
  shift # Move to the next argument
done

echo "🌓 ${bold}${magenta}SKY PI Installation${normal} 🌗"
printf "\n"

if [ -f "$RPI_SOURCE_LIST" ] && grep -q "http://archive.raspberrypi.com/debian/" $RPI_SOURCE_LIST; then
  info_echo "Raspbian OS detected"
else
  warn_echo "Raspbian OS not detected! SKY PI might not work properly. If you run into problems, please create an issue on GitHub including what OS you're running!"
fi

info_echo "Making sky-pi directory at $SKYPI_DIR..."
mkdir -p $SKYPI_DIR
cd $SKYPI_DIR

info_echo "Downloading latest sky-pi distribution..."

if [ "$pre" = true ]; then
  warn_echo "Downloading pre-release version"
  # check if jq is installed and offer to install it if not
  if ! command -v jq &> /dev/null; then
    ask_echo "jq is required to install pre-release versions. Would you like to install it now?"
    read -p "(y/n): " response </dev/tty
    if [[ "$response" =~ ^[Yy]$ ]]; then
      sudo apt-get update
      sudo apt-get install jq -y
    else
      error_echo "jq is required to install pre-release versions. Exiting..."
      exit 1
    fi
  fi
  download_url=$(curl -s https://api.github.com/repos/foxtrotperry/sky-pi/releases | jq -r '[.[] | select(.prerelease == true)] | .[0].assets[0].browser_download_url')
  wget -q --show-progress --progress=bar $download_url
else
  wget -q --show-progress --progress=bar https://github.com/foxtrotperry/sky-pi/releases/latest/download/$ZIP_FILE
fi

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
