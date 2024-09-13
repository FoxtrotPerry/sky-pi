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

warn_echo() {
  local message="$1"
  echo "⚠️ ${bold}${yellow}[WARN]${normal}${yellow}: $message${normal}"
}

error_echo() {
  local message="$1"
  echo "❌ ${bold}${red}[ERROR]${normal}${red}: $message${normal}" >&2
}

ask_echo() {
  local message="$1"
  echo "❔ ${cyan}[CONFIG]: $message${normal}"
}

success_echo() {
  local message="$1"
  echo "✅ ${bold}[SUCCESS]: $message${normal}"
}

done_echo() {
  local message="$1"
  echo "✨ ${bold}${green}[DONE]: $message${normal} ✨"
}

version_gt() {
    # Split versions into arrays
    IFS='.' read -ra CURRENT <<< "$1"
    IFS='.' read -ra REQUIRED <<< "$2"
    # Compare each segment
    for ((i=0; i<${#REQUIRED[@]}; i++)); do
        if [[ ${CURRENT[i]} -gt ${REQUIRED[i]} ]]; then
            return 0
        elif [[ ${CURRENT[i]} -lt ${REQUIRED[i]} ]]; then
            return 1
        fi
    done
    return 0
}

# Assumes there's a valid version of node installed
check_node_version() {
    local required_version="$1"
    local current_version=$(node -v | tr -d 'v')

    if version_gt "$current_version" "$required_version"
    then
        return 0
    else
        return 1
    fi
}

install_nvm() {
  info_echo "Installing NVM (Node Version Manager)..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
  load_nvm
  if command -v nvm &> /dev/null
  then
    NVM_VER=$(nvm -v)
    success_echo "NVM version $NVM_VER was successfully installed"
  else
    error_echo "Failed to install NVM"
    exit 1
  fi
}

install_node() {
  info_echo "Installing Node.js LTS..."
  # Using the NodeSource Node.js Binary Distributions
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
  if command -v node &> /dev/null
  then
    NODE_PATH=$(command -v node)
    success_echo "Node.js $(node -v) was successfully installed at: $NODE_PATH"
  else
    error_echo "Failed to install Node.js"
    exit 1
  fi
}

install_node_with_nvm() {
  info_echo "Installing Node.js LTS with NVM..."
  nvm install node
  if command -v node &> /dev/null
  then
    NODE_PATH=$(command -v node)
    success_echo "Node.js $(node -v) was successfully installed with NVM at: $NODE_PATH"
  else
    error_echo "Failed to install Node.js with NVM"
  fi
}

# Load NVM if installed
load_nvm() {
  # check the first directory we look for when finding nvm
  if [ -s "$HOME/.nvm/nvm.sh" ]
  then
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
  # one more place to check before we give up looking
  elif [ -s "$HOME/.config/nvm" ]
  then
    export NVM_DIR="$HOME/.config/nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
  fi
}

check_for_nvm() {
  load_nvm
  info_echo "Checking for NVM install..."
  if command -v nvm &> /dev/null
  then
    info_echo "NVM version $(nvm -v) successfully found"
  else
    ask_echo "(Optional) NVM is not installed. NVM is recommended to manage your node versions. Install now?"
    read -p "(y/n): " response </dev/tty
    if [[ "$response" =~ ^[Yy]$ ]]; then
        install_nvm
    fi
  fi
}

echo "🌓 ${bold}${magenta}SKY PI Setup${normal} 🌗"
printf "\n"

### Main script

info_echo "Checking for node install..."
# If node is installed and is greater than or equal to the version specified...
if command -v node &> /dev/null && check_node_version "18.0.0"
then
  # ...then the user is good to go and doesn't need to install anything.
  info_echo "Node.js version $(node -v) successfully found at: $(command -v node)"
else
  # ...otherwise, check if node is installed
  if command -v node &> /dev/null
  then
    # if it is, then it must be out of date. ask them to update node.
    ask_echo "Node.js $(node -v) is out of date. Do you want to update?"
  else
    # otherwise, node must not be installed. ask them if they want to install it.
    ask_echo "Node.js is not installed. Do you want to install it now?"
  fi
  read -p "(y/n): " response </dev/tty
  if [[ "$response" =~ ^[Yy]$ ]]; then
    # check if nvm is installed, if it isn't ask them if they want to install it
    check_for_nvm
    # try to load nvm incase they decided to install it
    load_nvm
    # if nvm is found...
    if command -v nvm &> /dev/null
    then
      # ...then install node with nvm
      install_node_with_nvm
    else
      # ...otherwise, install node via apt.
      install_node
    fi
    warn_echo "If node was previously installed on bare metal, make sure you remove that installation and restart your shell!"
  else
    error_echo "Node.js installation aborted. Please install or update Node.js to proceed."
    exit 1
  fi
fi

# At this point, node should be installed. We're still going to check just to make sure.
# if command -v node &> /dev/null
# then
#   info_echo "Looking for headless browser, will install if not found..."
#   node $SKYPI_DIR/sky-pi/screenshot/download.js
# else
#   error_echo "Node.js not found after install attempts"
#   exit 1
# fi

info_echo "Building sky-pi-draw project..."
python -m venv $SKYPI_DIR/sky-pi/draw/.venv
source $SKYPI_DIR/sky-pi/draw/.venv/bin/activate
python -m pip install $SKYPI_DIR/sky-pi/draw/ --quiet
deactivate

info_echo "Adding crontab entries..."
source $SKYPI_DIR/sky-pi/path_crontab.sh
source $SKYPI_DIR/sky-pi/add_crontab.sh

printf "\n"
done_echo "SKY PI setup complete!"

printf "\n"
ask_echo "In order to start SKY PI, a reboot is required. Would you like to reboot now?"
read -p "(y/n): " response </dev/tty
if [[ "$response" =~ ^[Yy]$ ]]; then
  sudo reboot
fi
