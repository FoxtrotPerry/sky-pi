#!/bin/bash

SKYPI_DIR="$HOME/.sky-pi"

bash $SKYPI_DIR/sky-pi/uninstall.sh
printf "\n"
bash $SKYPI_DIR/sky-pi/install.sh
