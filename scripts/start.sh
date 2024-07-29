#!/bin/sh

# if node is installed...
if command -v node &> /dev/null # "&> /den/null" mutes output
then
  # ...then start up the web app
  node ./webapp/packages/webapp/server.js
else
  # ...otherwise, prompt to run setup script and exit with error
  echo "Node.js is not installed. Please run ./setup.sh to proceed."
  exit 1
fi
