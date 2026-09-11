import {fileURLToPath} from 'node:url'
const OUT=fileURLToPath(new URL('.',import.meta.url)).replaceAll('\\','/').replace(/\/$/,'')
const BASE_URL=process.env.BASE_URL || 'http://127.0.0.1:4319'
import {chromium} from 'playwright'
const browser=await chromium.launch({headless:true})
const page=await browser.newPage({viewport:{width:1365,height:900}})
const mutations=[]
await page.addInitScript(()=>localStorage.setItem('ods.pixel.chat.v1',JSON.stringify({schema:1,chatId:'keep-existing',messages:[{role:'user',content:'Keep existing chat'}]})))
await page.route('**/api/**',route=>{
 if(route.request().method()!=='GET')mutations.push(new URL(route.request().url()).pathname)
 return route.fulfill({contentType:'application/json',body:JSON.stringify({available:true,model:'pixel/default',services:[],first_run:false})})
})
await page.goto(BASE_URL + '/')
await page.getByPlaceholder('Message Portal...').waitFor()
await page.getByLabel('Chat options').click()
const exported={schemaVersion:1,kind:'ods-pixel-conversation',conversation:{schema:1,chatId:'untrusted-old-id',messages:[{role:'user',content:'Imported original request'},{role:'assistant',content:'Imported partial result',status:'streaming',task:{runId:'old-run'}}],draft:'Review imported context',inFlight:true,requestId:'old-request'}}
await page.getByLabel('Choose conversation export').setInputFiles({name:'chat.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))})
await page.getByRole('button',{name:'Import as new conversation'}).click()
await page.getByText('Imported partial result',{exact:true}).waitFor()
if(await page.getByPlaceholder('Message Portal...').inputValue()!=='Review imported context')throw new Error('Lost imported draft')
const chats=await page.evaluate(()=>JSON.parse(localStorage.getItem('ods.pixel.conversations.v1')))
if(!chats.some(chat=>chat.chatId==='keep-existing')||chats.some(chat=>chat.chatId==='untrusted-old-id'))throw new Error('Import identity/library invariant failed')
if(mutations.some(path=>path.includes('/chat/')))throw new Error('Import submitted a chat request')
await page.screenshot({path:OUT + '/import-desktop.png'})
console.log('Import preserved existing history, allocated a new ID, retained text/draft and submitted no chat request.')
await browser.close()
