import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage();
const toasts = [];
page.on('console', m => { const t=m.text(); if(/corregí|error/i.test(t)) toasts.push(t); });

await page.goto('http://localhost:3000/login');
await page.fill('input[type="email"], input[name="email"]', 'admin@admin.com');
await page.fill('input[type="password"], input[name="password"]', 'Admin1234!');
await page.click('button[type="submit"]');
await page.waitForTimeout(2000);

await page.goto('http://localhost:3000/adoptar/solicitar?pet=ad78b5e3-0ac6-4568-98ba-101da36ea46c&name=Simba');
await page.waitForTimeout(1500);

// Asegurar campos obligatorios del paso 0
await page.fill('input[name="firstName"]', 'Admin');
await page.fill('input[name="lastName"]', 'Gonzalez');
await page.fill('input[name="phone"]', '1155550002');
await page.check('input[name="acceptsTerms"]');

// Hay selector preferredAnimal visible?
const hasSelect = await page.locator('select[name="preferredAnimal"]').count();
console.log('select preferredAnimal visible:', hasSelect);

// Click Continuar
await page.click('button:has-text("Continuar")');
await page.waitForTimeout(1500);

// Estamos en paso 1 (Dirección)?
const heading = await page.locator('.wizard-heading, h2').first().textContent().catch(()=>null);
const bodyText = await page.textContent('body');
console.log('Heading tras Continuar:', heading);
console.log('Avanzó a Dirección?:', /Direcci[oó]n|addressLine1/i.test(bodyText) || (await page.locator('input[name="addressLine1"]').count())>0);
console.log('Toasts de error capturados:', toasts.length ? toasts : '(ninguno)');
await page.screenshot({ path: '/tmp/adopt-step2.png', fullPage: true });
await browser.close();
