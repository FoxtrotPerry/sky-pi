import puppeteer, { HTTPResponse } from "puppeteer-core";
// import { Cache, Browser } from "@puppeteer/browsers";

// Resolution of typical e-ink display
const [WIDTH, HEIGHT] = [800, 480];

// Amount of retries allowed before
const RETRY_LIMIT = 7;

const takeScreenshot = async () => {
  /**
   * //TODO: Figure out work around for why chrome-headless-shell browsers
   * don't work on raspberry pi architecture.
   *
   * Until then, here are some links to start piecing it together:
   * https://github.com/puppeteer/puppeteer/issues/10698
   * https://stackoverflow.com/questions/60129309/puppeteer-on-raspberry-pi-zero-w
   */

  // const cache = new Cache(`${process.env.HOME}/.cache/puppeteer`);
  // const installed = cache.getInstalledBrowsers();

  // const headlessInstalledBrowser = installed.find((browserInstall) => {
  //   browserInstall.browser === "chrome-headless-shell";
  // });

  // console.log("Found browsers:");
  // console.log(installed);

  // const headlessInstalledBrowser = installed?.at(0);

  // if (!headlessInstalledBrowser) {
  //   throw new Error("No headless browser found in browser cache");
  // }

  const browser = await puppeteer.launch({
    // executablePath: headlessInstalledBrowser.executablePath,
    executablePath: "/usr/bin/chromium-browser",
    headless: true,
    args: [`--window-size=${WIDTH},${HEIGHT}`],
    defaultViewport: {
      width: WIDTH,
      height: HEIGHT,
    },
    timeout: 5_000_000,
  });
  const page = await browser.newPage();

  let response: HTTPResponse | null = null;
  for (let i = 0; i < RETRY_LIMIT; i++) {
    response = await page.goto("http://localhost:3000", {
      waitUntil: "networkidle2",
    });
    if (response && response.status() === 200) {
      break;
    }
  }

  await page.screenshot({
    path: `${process.env.HOME}/.sky-pi/sky-pi/screenshot/weather.png`,
  });

  await browser.close();
};

takeScreenshot();
