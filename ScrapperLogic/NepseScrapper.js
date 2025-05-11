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

      await this.page.goto(`https://nepalstock.com/`, {
        waitUntil: ["domcontentloaded", "networkidle2"],
        timeout: 120000,
      });
    } catch (error) {
      console.error(`Final scrape failure :`, error.message);
    }
  }

  async screenShotNepseStat() {
    const stat = await this.page.waitForSelector(".index__chart.box.height");
    await stat.screenshot({ path: this.filePath });

    console.log(`Saving screenshot to: ${this.filePath}`);

    console.log(stat);
    return this.filePath;
  }

  async topGainer() {
    const viewMoreBtn = await this.page.waitForSelector(
      `[data-target="#topGainerModal"]`
    );
    await viewMoreBtn.click();
    await wait(100);
    console.log("hmm");
    const topGainerSelector = await this.page.waitForSelector(
      "#topGainerModal .modal-dialog .modal-content"
    );

    console.log(topGainerSelector);

    await topGainerSelector.screenshot({ path: this.filePath });

    console.log(`Saving screenshot to: ${this.filePath}`);

    return this.filePath;
  }

  async topLoser() {
    const topLosersBtn = await this.page.waitForSelector(`#losers-tab`);
    console.log(topLosersBtn);
    await topLosersBtn.click();

    const viewMoreBtn = await this.page.waitForSelector(
      `[data-target="#topGainerModal"]`
    );
    await viewMoreBtn.click();
    await wait(100);
    console.log("hmm");
    const topGainerSelector = await this.page.waitForSelector(
      "#topGainerModal .modal-dialog .modal-content"
    );

    console.log(topGainerSelector);

    await topGainerSelector.screenshot({ path: this.filePath });

    console.log(`Saving screenshot to: ${this.filePath}`);

    return this.filePath;
  }
}

const ScrapperService = new ConfigClass();

export default ScrapperService;
