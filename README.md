# 🌓 Sky Pi 🌗

[![Release Sky Pi](https://github.com/FoxtrotPerry/sky-pi/actions/workflows/build-publish.yml/badge.svg)](https://github.com/FoxtrotPerry/sky-pi/actions/workflows/build-publish.yml)

Quickly glance sky condition information relevant to astrophotography

> [!IMPORTANT]
> READ BEFORE INSTALLING: Make sure you have I2C and SPI enabled on your Raspberry Pi!

If you don't know how to do this, you can check out the [sky-pi-draw project's README](./sky-pi-draw/README.md#how-to-enable-i2c-and-spi) for info about how to enable that.

## Installation

To install, simply open the terminal on your raspberry pi and run:

```bash
curl -sSL install.skypi.dev | bash
```

> Don't trust curling random urls blindly? Don't blame you. You can check out the [whole install script here](./scripts/install.sh).

## "How to Build" Tutorial

Short build guide for those who are starting with little to no knowledge of Raspberry Pis

### Supported Raspberry Pis

Development of this project was done on a very affordable [Raspberry Pi 3](https://www.adafruit.com/product/3055) (thanks [Kamin](https://github.com/kaminfay) for the free Raspberry Pi!)

I haven't personally tested on every possible Pi, but Sky-Pi should work on the following:

- [Raspberry Pi 3B](https://www.adafruit.com/product/3055)
- [Raspberry Pi 3B+](https://www.adafruit.com/product/3775)
- [Raspberry Pi 4B](https://www.adafruit.com/product/4295)
- [Raspberry Pi 5](https://www.adafruit.com/product/6007)
- [Raspberry Pi 400](https://www.adafruit.com/product/4795) (_please_ let me know if you try this one)

> [!NOTE]
> In testing, it seems that Raspberry Pi Zeros aren't powerful enough to run this project.

### What you'll need

1. Your choice of Raspberry Pi from the [list above](#supported-raspberry-pis)
2. [Pimoroni Inky Impressions 7.3" e-ink display](https://shop.pimoroni.com/products/inky-impression-7-3?variant=40512683376723)
3. Micro SD card, ideally with 16GB of memory or more
4. Power supply (something like [this](https://www.amazon.com/Smraza-Supply-Compatible-Raspberry-Adapter/dp/B0CBPJH1VK) should work just fine)

### Build Steps

1. Install [Raspbian OS](https://www.raspberrypi.com/software/) to your microSD card.
2. Put the sd card in the Raspberry Pi.
3. Attach the e-ink display to the Raspberry Pi.
4. Boot up the Raspberry Pi.
5. Go through whatever updates / setup steps are required.
6. Run `sudo apt update` followed by `sudo apt upgrade`.
7. Allow your Raspberry Pi to talk to the display by following [these steps on how to enable I2C and SPI](./sky-pi-draw/README.md#how-to-enable-i2c-and-spi).
8. Run the [install script](#installation) and follow the prompts.
9. Done! Just wait for the next refresh interval and you should be good to go!

## Install pre-release versions

To install the latest pre-release version of Sky Pi, you can run:

```bash
curl -sSL install.skypi.dev | bash -s -- --pre
```

## Uninstall

You can always completely uninstall Sky Pi by running:

```bash
curl -sSL uninstall.skypi.dev | bash
```
