import {fileURLToPath} from 'node:url'
const OUT=fileURLToPath(new URL('.',import.meta.url)).replaceAll('\\','/').replace(/\/$/,'')
const BASE_URL=process.env.BASE_URL || 'http://127.0.0.1:4319'
import {chromium} from 'playwright'
const browser=await chromium.launch({headless:true})
const page=await browser.newPage({viewport:{width:1365,height:900}})
await page.addInitScript(()=>{
 const sha='a'.repeat(64),siteId='site-'+sha.slice(0,24)
 const preview={schemaVersion:1,kind:'ods-pixel-workspace-preview',relativeDirectory:'demo',siteId,port:9437,url:`http://${siteId}.localhost:9437/${siteId}/`,files:1,bytes:300,sha256:sha,entrySha256:'b'.repeat(64)}
 localStorage.setItem('ods.pixel.chat.v1',JSON.stringify({schema:1,chatId:'viewport-smoke',messages:[{role:'user',content:'Build a responsive page'},{role:'assistant',content:'Published result'}],preview,workspaceOpen:true}))
})
await page.route('**/api/**',route=>route.fulfill({contentType:'application/json',body:JSON.stringify({available:true,model:'pixel/default',services:[],first_run:false})}))
await page.route('**/pixel-preview/**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><style>body{font:18px sans-serif;background:#e2efff;margin:20px}button{padding:14px}</style><h1>Responsive fixture</h1><button onclick="this.textContent=Number(this.textContent)+1">0</button></html>'}))
await page.goto(BASE_URL + '/')
const frame=page.frameLocator('iframe[title="Interactive Portal preview"]')
await frame.getByRole('button',{name:'0',exact:true}).click()
await page.getByLabel('Preview viewport size').selectOption('phone')
const actual=await page.locator('iframe[title="Interactive Portal preview"]').evaluate(frame=>({width:frame.clientWidth,height:frame.clientHeight}))
if(actual.width!==375||actual.height!==667) throw new Error('Incorrect actual viewport '+JSON.stringify(actual))
await frame.getByRole('button',{name:'1',exact:true}).waitFor()
await page.getByRole('button',{name:'Rotate viewport'}).click()
await frame.getByRole('button',{name:'1',exact:true}).waitFor()
await page.screenshot({path:OUT + '/viewport-desktop.png'})
console.log('Actual iframe viewport 375x667; application state survives resize and rotation.')
await browser.close()
