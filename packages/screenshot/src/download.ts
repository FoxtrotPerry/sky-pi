import {
  Cache,
  install,
  Browser,
  detectBrowserPlatform,
  resolveBuildId,
} from "@puppeteer/browsers";

// TODO: Call this script from within the setup script

const tag = "stable";
const browser = Browser.CHROMEHEADLESSSHELL;

const checkAndInstallBrowser = async () => {
  // Puppeteer default browser installation directory
  const cache = new Cache(`${process.env.HOME}/.cache/puppeteer`);
  const installed = cache.getInstalledBrowsers();

  console.log(`🔎 Looking for puppeteer browser in ${cache.rootDir}`);

  // if there are no browsers installed, then install one.
  if (installed.length === 0) {
    console.log(`No puppeteer browser found!`);
    const detectedBrowserPlatform = detectBrowserPlatform();

    if (!detectedBrowserPlatform) {
      throw new Error("No OS platform able to be detected.");
    }

    const resolvedBuildId = await resolveBuildId(
      browser,
      detectedBrowserPlatform,
      tag
    );

    if (resolvedBuildId) {
      console.log(
        `📂 Installing browser "${browser}", buildId: ${resolvedBuildId}`
      );
      const installedBrowser = await install({
        browser,
        cacheDir: cache.rootDir,
        buildId: resolvedBuildId,
      });
      console.log(
        `Browser executable path: ${installedBrowser.executablePath}`
      );
      console.log(`✅ Browser installed!`);
    } else {
      throw new Error(
        `No build id able to be resolved from parameters given.\nbrowser: ${browser}\nplatform: ${detectedBrowserPlatform}\ntag: ${tag}`
      );
    }
  } else {
    console.log(`Browser executable path: ${installed[0]?.executablePath}`);
    console.log("✅ Puppeteer browser found!");
  }
};

checkAndInstallBrowser().catch((err) => {
  console.error("Error checking or installing browser:", err);
});
