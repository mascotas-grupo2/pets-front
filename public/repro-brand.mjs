import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage();
const broken = [];
page.on('requestfailed', r => broken.push('FAILED '+r.url()));
page.on('response', r => { if (r.url().includes('favicon') || r.url().includes('/images/')) { if(r.status()>=400) broken.push(r.status()+' '+r.url()); } });
await page.goto('http://localhost:3000/');
await page.waitForTimeout(1500);
const brand = page.locator('.brand').first();
await brand.scrollIntoViewIfNeeded();
await brand.screenshot({ path: '/tmp/brand.png' });
// estado de la img del logo
const imgInfo = await page.locator('.brand img, .brand-paw').first().evaluate(el => ({
  src: el.currentSrc || el.src, naturalWidth: el.naturalWidth, naturalHeight: el.naturalHeight, complete: el.complete
})).catch(e => 'no img: '+e.message);
console.log('logo img:', JSON.stringify(imgInfo));
console.log('href del brand:', await brand.getAttribute('href'));
console.log('recursos rotos:', broken.length?broken:'(ninguno)');
await browser.close();
