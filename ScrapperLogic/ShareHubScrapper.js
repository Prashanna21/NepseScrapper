import puppeteer from "puppeteer";
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export class ConfigClass {
  browser;
  page;
  filePath = "screenshot.png";

  constructor() {
    this.init();
  }

  async init() {
    try {
      this.browser = await puppeteer.launch({
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

      this.page = await this.browser.newPage();

      await this.page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
      );
      await this.page.setExtraHTTPHeaders({
        "Accept-Language": "en-US,en;q=0.9",
      });
    } catch (error) {
      console.error(`Final scrape failure :`, error.message);
    }
  }

  async stockDetails(symbol) {
    await this.page.goto(`https://sharehubnepal.com/company/${symbol}`, {
      waitUntil: ["domcontentloaded", "networkidle2"],
      timeout: 120000,
    });

    // const ad = this.page.locator(
    //   ".relative w-[90vw].max-w-[500px].rounded-lg.shadow-lg.overflow-hidden"
    // );

    // if (ad) ad.remove();

    const companyAnalysisSelector = await this.page.waitForSelector(
      `[aria-labelledby="company-todays-trade-analysis"]`
    );

    console.log(companyAnalysisSelector);

    await companyAnalysisSelector.screenshot({ path: this.filePath });

    console.log(`Saving screenshot to: ${this.filePath}`);

    return this.filePath;
  }
}

const sharehubScrapperService = new ConfigClass();

export default sharehubScrapperService;
