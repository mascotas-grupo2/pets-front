import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:3000/login');
await page.fill('input[name="email"]','admin@admin.com');
await page.fill('input[name="password"]','Admin1234!');
await page.click('button[type="submit"]'); await page.waitForTimeout(2500);

// una solicitud
const list = await page.evaluate(async ()=> await (await fetch('/api/proxy/adoptions/admin/paged?page=1&pageSize=20')).json());
const sol = list.items.find(i=>i.status==='NUEVA' || i.status==='EN_EVALUACION') ?? list.items[0];
console.log('solicitud de prueba id:', sol.id, '| estado:', sol.status);

// 1) togglear 2 checks
for (const item of ['Verificó identidad','Consultó sobre vivienda']) {
  await page.evaluate(async ({id,item})=>{ await fetch(`/api/proxy/adoptions/${id}/checks`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({item,done:true})}); }, {id:sol.id,item});
}
// 2) leer evaluación (persistió?)
const ev = await page.evaluate(async (id)=> await (await fetch(`/api/proxy/adoptions/${id}/evaluation`)).json(), sol.id);
console.log('checked persistido:', ev.checked);
// 3) agregar nota
await page.evaluate(async (id)=>{ await fetch(`/api/proxy/adoptions/${id}/notes`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:'Buena impresión, vivienda apta.'})}); }, sol.id);
const ev2 = await page.evaluate(async (id)=> await (await fetch(`/api/proxy/adoptions/${id}/evaluation`)).json(), sol.id);
console.log('notas:', ev2.notes.map(n=>n.text));

// 4) Gating: poner solicitud en EN_EVALUACION primero (si está NUEVA), luego intentar ENTREVISTA sin tener checks... ya tiene 2. Probemos gating de ACEPTADA_CON_SEGUIMIENTO (requiere 5) -> deberia faltar.
// Forzamos avance incremental: NUEVA->EN_EVALUACION
async function patch(st){ return page.evaluate(async ({id,st})=>{ const r=await fetch(`/api/proxy/adoptions/${id}/status`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:st})}); return {status:r.status, body:(await r.text()).slice(0,160)}; }, {id:sol.id,st}); }
console.log('cur estado:', sol.status);
