import puppeteer from "puppeteer";
import { Cache, Browser } from "@puppeteer/browsers";

// Resolution of typical e-ink display
const [width, height] = [800, 480];

const takeScreenshot = async () => {
  const cache = new Cache(`${process.env.HOME}/.cache/puppeteer`);
  const installed = cache.getInstalledBrowsers();

  const headlessInstalledBrowser = installed.find((browserInstall) => {
    browserInstall.browser === Browser.CHROMEHEADLESSSHELL;
  });

  console.log("Found browsers:");
  console.log(installed);

  if (!headlessInstalledBrowser) {
    throw new Error("No headless browser found in browser cache");
  }

  const browser = await puppeteer.launch({
    executablePath: headlessInstalledBrowser.executablePath,
    headless: true,
    args: [`--window-size=${width},${height}`],
    defaultViewport: {
      width: width,
      height: height,
    },
  });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000", {
    waitUntil: "networkidle2",
  });
  await page.screenshot({
    path: "weather.png",
  });

  await browser.close();
};

takeScreenshot();
