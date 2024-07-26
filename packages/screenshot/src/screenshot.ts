import puppeteer from "puppeteer";

// Resolution of typical e-ink display
const [width, height] = [800, 480];

const takeScreenshot = async () => {
  const browser = await puppeteer.launch({
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
