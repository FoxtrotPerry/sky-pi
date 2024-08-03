import { Cache, install, Browser } from "@puppeteer/browsers";

// FIXME: Change file to ts and allow it to be transpiled / minified by rollup
// TODO: Finish logic where we install a browser if none is detected. use os package
// to determine which one to install

const checkAndInstallBrowser = async () => {
  // Puppeteer default browser installation directory
  const cache = new Cache(`${process.env.HOME}/.cache/puppeteer`);
  console.log(cache.rootDir);
  const installed = cache.getInstalledBrowsers();

  // TODO: remove console log
  console.log(installed);

  // if there are no browsers installed
  if (installed.length === 0) {
    // install browser based on OS
    // await install({
    //   browser: Browser.
    // })
  }
};

checkAndInstallBrowser().catch((err) => {
  console.error("Error checking or installing browser:", err);
});
