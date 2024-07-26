#!/bin/sh

bold=$(tput bold)
normal=$(tput sgr0)
green=$(tput setaf 2)
red=$(tput setaf 1)
magenta=$(tput setaf 5)
cyan=$(tput setaf 6)

info_echo() {
  local message=$1
  echo "⛅️ [INFO]: $message"
}

error_echo() {
  local message=$1
  echo "❌ [ERROR]: $message" >&2
}

ask_echo() {
  local message=$1
  echo "❔ ${cyan}[PERMISSION]: $message${normal}"
}

success_echo() {
  local message=$1
  echo "✅ ${bold}[SUCCESS]: $message${normal}"
}

done_echo() {
  local message=$1
  echo "✨ ${bold}${green}[DONE]: $message${normal} ✨"
}

install_node() {
  info_echo "Installing Node.js LTS..."
  # Using the NodeSource Node.js Binary Distributions
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  if command -v node &> /dev/null
  then
    NODE_PATH=$(command -v node)
    success_echo "Node.js was successfully installed at: $NODE_PATH"
  else
    error_echo "Failed to install Node.js."
    exit 1
  fi
}

install_curl() {
  info_echo "Installing curl..."
  sudo apt-get install -y curl
  if command -v curl &> /dev/null
  then
    CURL_PATH=$(command -v node)
    success_echo "curl was successfully installed at: $CURL_PATH"
  else
    error_echo "Failed to install curl."
    exit 1
  fi
}

clear
echo "🌓 ${bold}${magenta}SKY PI Setup${normal} 🌗"
echo "\n"

info_echo "Checking for curl install..."
if command -v curl &> /dev/null
then
  info_echo "curl successfully found at: $(command -v curl)"
else
  ask_echo "curl is not installed. Do you want to install it now? (y/n)"
  read -r response
  if [[ "$response" =~ ^[Yy]$ ]]
  then
      install_curl
  else
      error_echo "curl installation aborted. Please install curl to proceed."
      exit 1
  fi
fi

info_echo "Checking for node install..."
if command -v node &> /dev/null
then
  info_echo "Node.js successfully found at: $(command -v node)"
else
  ask_echo "Node.js is not installed. Do you want to install it now? (y/n)"
  read -r response
  if [[ "$response" =~ ^[Yy]$ ]]
  then
      install_node
  else
      error_echo "Node.js installation aborted. Please install Node.js to proceed."
      exit 1
  fi
fi

echo "\n"
done_echo "SKY PI setup complete!"
