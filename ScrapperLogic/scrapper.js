import puppeteer from "puppeteer";
const scrapper = async (symbol) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--single-process",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });

    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(60000); // Increase timeout
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    // Navigate and wait for network to be idle
    const response = await page.goto(
      `https://merolagani.com/CompanyDetail.aspx?symbol=${symbol}`,
      { waitUntil: "networkidle2", timeout: 60000 }
    );

    if (!response.ok()) {
      throw new Error(`Page failed to load: HTTP ${response.status()}`);
    }

    // Wait for the price element to be stable
    await page.waitForSelector(
      "#ctl00_ContentPlaceHolder1_CompanyDetail1_lblMarketPrice",
      { timeout: 15000, visible: true }
    );

    const price = await page.$eval(
      "#ctl00_ContentPlaceHolder1_CompanyDetail1_lblMarketPrice",
      (el) => el.textContent.trim()
    );

    if (!price) throw new Error("Price not found");

    return price;
  } catch (error) {
    console.error(`Scraping failed for ${symbol}:`, error.message);
    throw error; // Re-throw for Express route handling
  } finally {
    if (browser) await browser.close().catch((e) => console.error(e));
  }
};

export default scrapper;
