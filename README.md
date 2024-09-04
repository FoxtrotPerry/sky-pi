# 🌓 Sky Pi 🌗

[![Release Sky Pi](https://github.com/FoxtrotPerry/sky-pi/actions/workflows/build-publish.yml/badge.svg)](https://github.com/FoxtrotPerry/sky-pi/actions/workflows/build-publish.yml)

Quickly glance info about sky conditions that impact astrophotography

> [!IMPORTANT]
> READ BEFORE INSTALLING: Make sure you have I2C and SPI enabled on your Raspberry Pi!

If you don't know how to do this, you can check out the [sky-pi-draw project's README](./sky-pi-draw/README.md#how-to-enable-i2c-and-spi) for info about how to enable that.

## Installation

To install, simply open your terminal on your raspberry pi and run:

```bash
curl -sSL install.skypi.dev | bash
```

> Don't trust curling random urls blindly? Don't blame you. You can check out the [whole install script here](./scripts/install.sh).

## Uninstall

You can always completely uninstall Sky Pi by running:

```bash
curl -sSL uninstall.skypi.dev | bash
```
