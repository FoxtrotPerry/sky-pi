#!/usr/bin/env python3
import time

from inky.auto import auto
from inky.inky_uc8159 import CLEAN

inky = auto(ask_user=True, verbose=True)

colors = ["Black", "White", "Green", "Blue", "Red", "Yellow", "Orange"]

# Cycle through all available colors
for color in range(7):
    print("Color: {}".format(colors[color]))
    for y in range(inky.height):
        for x in range(inky.width):
            inky.set_pixel(x, y, color)
    inky.set_border(color)
    inky.show()
    time.sleep(3.0)

# Clear the display
for _ in range(2):
    for y in range(inky.height):
        for x in range(inky.width):
            inky.set_pixel(x, y, CLEAN)
    inky.show()
    time.sleep(1.0)
