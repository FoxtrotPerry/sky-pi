#!/bin/sh

# if node is installed...
if command -v node &> /dev/null
then
  # ...then run the screenshot service
  node ./screenshot/screenshot.js
else
# ...otherwise, prompt to run setup script and exit with error
  echo "Node.js is not installed. Please run ./setup.sh to proceed."
  exit 1
fi
