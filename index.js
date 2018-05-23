const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const { URL } = require('url');
const { writeFile } = require('fs');
const { promisify } = require('util');
const writeFileAsync = promisify(writeFile);

if (!process.env.URL) {
  console.log('Please provide an URL');
  process.exit(1);
}

(async () => {
  console.log(`Running Lighthouse against ${process.env.URL}\n`);

  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    executablePath: '/usr/bin/chromium-browser'
  });

  const results = await lighthouse(process.env.URL, {
    port: (new URL(browser.wsEndpoint())).port,
    output: 'json',
    logLevel: 'error'
  });

  const fileData = JSON.stringify(results, null, 2);
  await writeFileAsync('/lighthouse-results/latest.json', fileData, 'utf8');
  await writeFileAsync(`/lighthouse-results/${new Date().toISOString()}.json`, fileData, 'utf8');

  console.log(`Lighthouse results for ${process.env.URL}\n`);
  const { categories } = results.lhr;
  for (const key in categories) {
    const title = categories[key].title;
    const score = categories[key].score * 100;
    console.log(`${title}=${score}%`);
  }

  process.exit(0);
})();
