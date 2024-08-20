#!/bin/bash

SKYPI_DIR="$HOME/.sky-pi/"

# if node is installed...
if command -v node &> /dev/null # "&> /den/null" mutes output
then
  # ...then start up the web app
  node $SKYPI_DIR/sky-pi/webapp/packages/webapp/server.js
else
  # ...otherwise, prompt to run setup script and exit with error
  echo "Node.js is not installed. Please run the sky-pi setup.sh script."
  exit 1
fi
