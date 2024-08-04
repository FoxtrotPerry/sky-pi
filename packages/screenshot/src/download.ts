import {
  Cache,
  install,
  Browser,
  detectBrowserPlatform,
  resolveBuildId,
} from "@puppeteer/browsers";

// FIXME: Change file to ts and allow it to be transpiled / minified by rollup
// TODO: Finish logic where we install a browser if none is detected. use os package
// to determine which one to install

const checkAndInstallBrowser = async () => {
  // Puppeteer default browser installation directory
  const cache = new Cache(`${process.env.HOME}/.cache/puppeteer`);
  console.log(cache.rootDir);
  const installed = cache.getInstalledBrowsers();
  const detectedBrowserPlatform = detectBrowserPlatform();
  let resolvedBuildId;
  if (detectedBrowserPlatform) {
    resolvedBuildId = await resolveBuildId(
      Browser.CHROMIUM,
      detectedBrowserPlatform,
      "stable"
    );
  }

  // TODO: remove console log
  console.log({
    installed,
    detectedBrowserPlatform,
    resolvedBuildId,
  });

  // if there are no browsers installed
  if (installed.length === 0) {
    console.log("NO BROWSER FOUND. We'd install at this point");
    // install browser based on OS
    // await install({
    //   browser: Browser.CHROMEHEADLESSSHELL,
    //   cacheDir: cache.rootDir,
    //   buildId: resolvedBuildId,
    // });
  } else {
    console.log(
      "Oh you already have a browser? Well I didn't want to install one for you anyways, so.."
    );
  }
};

checkAndInstallBrowser().catch((err) => {
  console.error("Error checking or installing browser:", err);
});
