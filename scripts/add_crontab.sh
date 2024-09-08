#!/bin/bash

bold=$(tput bold)
normal=$(tput sgr0)
green=$(tput setaf 2)
yellow=$(tput setaf 3)
red=$(tput setaf 1)
magenta=$(tput setaf 5)
cyan=$(tput setaf 6)

SKYPI_DIR="$HOME/.sky-pi"

info_echo() {
  local message="$1"
  echo "⛅️ ${bold}[INFO]${normal}: $message"
}

ask_echo() {
  local message="$1"
  echo -n "❔ ${cyan}[CONFIG]: $message${normal}"
}

error_echo() {
  local message="$1"
  echo "❌ ${bold}${red}[ERROR]${normal}${red}: $message${normal}" >&2
}

config_draws_per_hour() {
  local default_value=$1
  local min_value=$2
  local max_value=$3

  ask_echo "Between $min_value and $max_value, how many times per hour would you like sky-pi to update? [Default: $default_value]: "
  while true; do
    read -r user_input </dev/tty

    # use the default value if the user doesn't provide any input
    user_input=${user_input:-$default_value}

    # if the input is valid...
    if [[ $user_input =~ ^-?[0-9]+$ ]] && (( user_input >= min_value && user_input <= max_value )); then
      # echo screenshot and draw entry into temp file
      # why we need to use bash specifically: https://askubuntu.com/a/752245
      echo "*/$((60/$user_input)) * * * * node $SKYPI_DIR/sky-pi/screenshot/screenshot.js && bash -c '$SKYPI_DIR/sky-pi/actions/draw.sh'" >> tmp_crontab
      break
    else
      printf "\nPlease enter a valid number between $min_value and $max_value: "
    fi
  done
}

# check if crontab is installed
if command -v crontab &> /dev/null; then
  # write out current crontab config to temp file
  crontab -l > tmp_crontab
  config_draws_per_hour 2 1 6
  # refresh and clean the display every night at midnight, draw to screen after refresh is complete
  echo "0 0 * * * bash -c '$SKYPI_DIR/sky-pi/actions/refresh.sh' && bash -c '$SKYPI_DIR/sky-pi/actions/draw.sh'" >> tmp_crontab
  # echo app startup entry into temp file
  echo "@reboot bash -c '$SKYPI_DIR/sky-pi/actions/start.sh'" >> tmp_crontab
  # install new cron file
  crontab tmp_crontab
  rm tmp_crontab
else
  error_echo "'crontab' not installed! Please install crontab with `sudo apt install cron`"
fi
