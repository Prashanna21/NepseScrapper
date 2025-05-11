import puppeteer from "puppeteer";

const scrapper = async (symbol) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // Critical for Render
        "--single-process", // Reduces memory usage
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });

    const page = await browser.newPage();

    // 2. Configure stealth and stability
    await page.setDefaultNavigationTimeout(120000);
    await page.setDefaultTimeout(30000);
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    // 3. Block unnecessary resources
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      req.resourceType() === "document" ? req.continue() : req.abort();
    });

    // 4. Navigation with frame persistence
    let finalPrice;
    await Promise.race([
      page.goto(`https://merolagani.com/CompanyDetail.aspx?symbol=${symbol}`, {
        waitUntil: "domcontentloaded",
        timeout: 90000,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Navigation timeout")), 90000)
      ),
    ]);

    const companyTitleSelector = await page.waitForSelector(
      "#ctl00_ContentPlaceHolder1_CompanyDetail1_companyName"
    );

    const compnayTitle = await companyTitleSelector?.evaluate(
      (el) => el.textContent
    );

    console.log(compnayTitle);

    // 5. Frame-safe evaluation
    finalPrice = await page.evaluate((selector) => {
      try {
        const frame = Array.from(document.querySelectorAll("iframe")).find(
          (f) => f.contentDocument?.querySelector(selector)
        );
        const targetDoc = frame?.contentDocument || document;
        return targetDoc.querySelector(selector)?.textContent?.trim();
      } catch (err) {
        console.error("Frame evaluation error:", err);
        return null;
      }
    }, "#ctl00_ContentPlaceHolder1_CompanyDetail1_lblMarketPrice");

    if (!finalPrice) throw new Error("Price element not found in any frame");
    return finalPrice;
  } catch (error) {
    console.error(`Final scrape failure [${symbol}]:`, error.message);
    throw new Error(`Scraping permanently failed: ${error.message}`);
  } finally {
    if (browser)
      await browser.close().catch((e) => console.error("Cleanup error:", e));
  }
};

export default scrapper;
