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

I haven't personally tested on every possible Pi, but it stands to reason the following Pis would be able to run Sky Pi just fine:

- [Raspberry Pi 3B](https://www.adafruit.com/product/3055)
- [Raspberry Pi 3B+](https://www.adafruit.com/product/3775)
- [Raspberry Pi 4B](https://www.adafruit.com/product/4295)

> [!NOTE]
>
> - Raspberry Pi 5 will be supported when `gpiod` is finished [being integrated into the `inky` python package](https://github.com/pimoroni/inky/pull/182).
> - In testing, it seems that Raspberry Pi Zeros aren't powerful enough to run this project.

### What you'll need

1. Raspberry Pi
2. [Pimoroni Inky Impressions 7.3" e-ink display](https://shop.pimoroni.com/products/inky-impression-7-3?variant=40512683376723)
3. Micro SD card, ideally with more than 16GB of memory
4. Power supply (something like [this](https://www.amazon.com/Smraza-Supply-Compatible-Raspberry-Adapter/dp/B0CBPJH1VK) should work just fine)

### Build Steps

1. Install [Raspbian OS](https://www.raspberrypi.com/software/) to your microSD card.
2. Put the sd card into the Raspberry Pi.
3. Install the e-ink display to the Raspberry Pi.
4. Boot up the Raspberry Pi.
5. Go through whatever updates / setup steps are required.
6. Run `sudo apt update` followed by `sudo apt upgrade`.
7. Allow your Raspberry Pi to talk to the display by following [these steps on how to enable I2C and SPI](./sky-pi-draw/README.md#how-to-enable-i2c-and-spi).
8. Run the [install script](#installation) and follow the prompts.
9. Done! Just wait for the next refresh interval and you should be good to go!

## Uninstall

You can always completely uninstall Sky Pi by running:

```bash
curl -sSL uninstall.skypi.dev | bash
```
