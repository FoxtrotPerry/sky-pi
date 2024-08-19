#!/bin/bash

SKYPI_DIR="$HOME/.sky-pi/"

source $SKYPI_DIR/sky-pi/draw/.venv/bin/activate
python $SKYPI_DIR/sky-pi/draw/src/sky_pi_draw/draw.py
deactivate
