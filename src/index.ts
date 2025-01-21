import open from 'open';
import puppeteer from 'puppeteer';

const IS_PREPARE = false;
const TARGET_URL =
  'https://buy.cloud.tencent.com/lighthouse?blueprintType=PURE_OS&blueprintOfficialId=lhbp-mxml4cnq&regionId=5&zone=ap-hongkong-1';

const browser = await puppeteer.launch({
  ...(IS_PREPARE
    ? {
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized'],
      }
    : {}),
  userDataDir: './data',
});
const page = (await browser.pages())[0];

await page.goto(TARGET_URL);

const getSoldOut = async (index: number) => {
  const soldOutList = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.buy-compare-package-option')).map(el => el.classList.contains('is-soldout'))
  );
  console.log('list', soldOutList);
  return soldOutList[index];
};

const check = async () => {
  await page.waitForSelector('.buy-compare-package-option .unit');
  console.log(new Date().toLocaleString('zh-Hans-CN'));
  const isSoldOut = await getSoldOut(1);
  console.log('2c2g sold out', isSoldOut);
  if (!isSoldOut) {
    await open(TARGET_URL);
    await browser.close();
    process.exit(0);
  }
};

if (!IS_PREPARE) {
  check();

  setInterval(async () => {
    await page.reload();
    await check();
  }, 60e3);
}
