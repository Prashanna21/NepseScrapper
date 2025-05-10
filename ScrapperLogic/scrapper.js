import puppeteer from "puppeteer";

const scrapper = async (symbol) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(`https://merolagani.com/CompanyDetail.aspx?symbol=${symbol}`);

  await page.setViewport({ width: 1080, height: 1024 });

  const priceSelector = await page.waitForSelector(
    "#ctl00_ContentPlaceHolder1_CompanyDetail1_lblMarketPrice"
  );
  const price = await priceSelector.evaluate((el) => el.textContent);

  await browser.close();

  return price;
};

export default scrapper;
