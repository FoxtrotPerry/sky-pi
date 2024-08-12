#!/usr/bin/env python3

from os import environ

from inky.auto import auto
from PIL import Image

with Image.open(
    environ("HOME") + "/.sky-pi/sky-pi/screenshot/weather.png", "r"
) as new_frame:
    inky = auto(ask_user=True, verbose=True)
    saturation = 0.5
    resized_image = new_frame.resize(inky.resolution)

    inky.set_image(resized_image, saturation=saturation)
    inky.show()
