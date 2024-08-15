# sky-pi-draw

Handles rendering the weather screenshots to the [Pimoroni Inky Impressions 7.3" 800x480 e-ink display](https://shop.pimoroni.com/products/inky-impression-7-3?variant=40512683376723).

> [!IMPORTANT]
> Before running, make sure you have I2C and SPI enabled on your Raspberry Pi!

## How to enable I2C and SPI

1. Running the following:

```bash
sudo raspi-config
```

2. In the shown menu, go to "Interface Options" (should be list item #3)

3. Enable SPI (item I4) and I2C (item I5)

## Development

To get up and running, first make sure you're running on a linux system as the [inky](https://pypi.org/project/inky/) package used by this project requires the [linux kernel specific SPI library](https://www.kernel.org/doc/html/latest/spi/).

With that out of the way, here's how you get started:

1. Make sure you're running python 3.11 (version shipped with raspbian)

2. Run the following to create a new virtual environment

```bash
python -m venv .venv
```

3. Activate the newly created virtual environment

```bash
source .venv/bin/activate
```

4. Install the project's dependencies

```bash
python -m pip install .
```

5. Run [`draw.py`](./src/sky_pi_draw/draw.py)

```bash
python src/sky_pi_draw/draw.py
```

## Troubleshooting

Some general guidance for how to deal with issues found during development

### Using a Raspberry Pi 5

If you're using an RP5 and are running into problems connecting to the display when running the sky-pi-draw, you might need to install the new python specific GPIO package for Raspberry Pi. You can do this by running:

```bash
sudo apt remove python3-rpi.gpio
sudo apt install python3-rpi-lgpio
```

If you're still running into issues, you can try removing the `RPi.GPIO` package used by sky-pi-draw by default and instead use [rpi-lgpio](https://pypi.org/project/rpi-lgpio/). You can do do this by running:

```bash
sudo apt remove python3-rpi.gpio
pip3 install rpi-lgpio
```

> [!WARNING]
> Make sure you've removed [`RPi.GPIO`](https://pypi.org/project/RPi.GPIO/) before you try to run the program. Both the original [`RPi.GPIO`](https://pypi.org/project/RPi.GPIO/) and [`rpi-lgpio`](https://pypi.org/project/rpi-lgpio/) attempt to install a module named `RPi.GPIO` so having them both installed at the same time will cause issues.
