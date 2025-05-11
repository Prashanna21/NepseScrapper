import puppeteer from "puppeteer";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const websiteScreensShot = async (symbol) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // Critical for Render
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });
    // await page.setRequestInterception(true);
    // page.on("request", (req) => {
    //   req.resourceType() === "document" ? req.continue() : req.abort();
    // });

    await page.goto(`${symbol}`, {
      waitUntil: ["domcontentloaded", "networkidle2"],
      timeout: 120000,
    });

    const filePath = "screenshot.png";

    await page.screenshot({ path: filePath, fullPage: true });

    console.log(`Saving screenshot to: ${filePath}`);
    await page.screenshot({ path: filePath, fullPage: true });

    return filePath;
  } catch (error) {
    console.error(`Final scrape failure [${symbol}]:`, error.message);
  } finally {
    if (browser)
      await browser.close().catch((e) => console.error("Cleanup error:", e));
  }
};
