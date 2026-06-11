import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

await page.goto('http://localhost:3000/login');
await page.fill('input[type="email"], input[name="email"]', 'admin@admin.com');
await page.fill('input[type="password"], input[name="password"]', 'Admin1234!');
await page.click('button[type="submit"]');
await page.waitForTimeout(2000);

const payload = {
  petId: 'ad78b5e3-0ac6-4568-98ba-101da36ea46c',
  preferredAnimal: 'gato',
  firstName: 'Admin', lastName: 'Gonzalez',
  email: 'admin@admin.com', phone: '1155550002',
  addressLine1: 'Calle Falsa 123', addressLine2: '',
  postcode: '1714', town: 'Hurlingham',
  hasGarden: 'si', livingSituation: 'casa', householdSetting: 'urbano', activityLevel: 'moderado',
  adults: 1, children: 0, visitingChildren: 'no', hasFlatmates: 'no',
  hasAllergies: 'no', allergies: '', otherAnimals: 'no', otherAnimalsDetail: '',
  neutered: 'na', vaccinated: 'na', experience: '', acceptsTerms: true,
};
const res = await page.evaluate(async (body) => {
  const r = await fetch('/api/proxy/pet/adoptar', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: r.status, text: await r.text() };
}, payload);
console.log('STATUS:', res.status);
console.log('BODY:', res.text.slice(0, 1500));
await browser.close();
