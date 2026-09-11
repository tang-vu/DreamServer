import {fileURLToPath} from 'node:url'
const OUT=fileURLToPath(new URL('.',import.meta.url)).replaceAll('\\','/').replace(/\/$/,'')
const BASE_URL=process.env.BASE_URL || 'http://127.0.0.1:4319'
import {chromium} from 'playwright'
import {createHash} from 'node:crypto'
import {readFile} from 'node:fs/promises'
const browser=await chromium.launch({headless:true})
const page=await browser.newPage({viewport:{width:1365,height:900},acceptDownloads:true})
const source='// Verified Việt source\nconsole.log("match one")\nconsole.log("match two")\n'
const html='<h1>Verified fixture</h1>', binary=Buffer.from([0,255,13,10,42])
const hash=value=>createHash('sha256').update(value).digest('hex')
const contents={'index.html':Buffer.from(html),'assets/app.js':Buffer.from(source),'result.bin':binary}
const files=Object.entries(contents).map(([path,bytes])=>({path,bytes:bytes.length,sha256:hash(bytes)}))
const sha='a'.repeat(64), siteId='site-'+sha.slice(0,24)
const preview={schemaVersion:1,kind:'ods-pixel-workspace-preview',relativeDirectory:'demo',siteId,port:9437,url:`http://${siteId}.localhost:9437/${siteId}/`,files:3,bytes:files.reduce((n,file)=>n+file.bytes,0),sha256:sha,entrySha256:hash(html)}
const manifest={schemaVersion:1,siteId,sha256:sha,bytes:preview.bytes,files}
const changes={schemaVersion:1,scope:'published-snapshots',siteId,sha256:sha,beforeSiteId:null,beforeSha256:null,changes:files.map(file=>({path:file.path,change:'published',additions:1,deletions:0,truncated:false,diff:[{type:'add',oldLine:null,newLine:1,text:'Published '+file.path}]}))}
await page.addInitScript(preview=>localStorage.setItem('ods.pixel.chat.v1',JSON.stringify({schema:1,chatId:'files-browser',messages:[{role:'user',content:'Build project'},{role:'assistant',content:'Published fixture',publication:preview}],preview,workspaceOpen:true})),preview)
await page.route('**/api/**',route=>route.fulfill({contentType:'application/json',body:JSON.stringify({available:true,model:'pixel/default',services:[],first_run:false})}))
await page.route('**/pixel-preview/**',route=>{
 const path=new URL(route.request().url()).pathname.split('/').slice(3).join('/')
 if(path.includes('__ods_changes__'))return route.fulfill({contentType:'application/json',body:JSON.stringify(changes)})
 return route.fulfill({contentType:path==='__ods_manifest__.json'?'application/json':'text/plain',body:path==='__ods_manifest__.json'?JSON.stringify(manifest):contents[path]||html})
})
try{
 await page.goto(BASE_URL + '/')
 await page.getByRole('button',{name:'Files',exact:true}).click()
 await page.getByRole('button',{name:/^assets\/app.js/}).waitFor()
 await page.getByLabel('File type',{exact:true}).selectOption('js')
 await page.getByLabel('Sort task files').selectOption('largest')
 await page.getByRole('button',{name:/^assets\/app.js/}).click()
 await page.getByLabel('Find in source',{exact:true}).fill('match')
 await page.getByText(/1 of 2 matching lines/).waitFor()
 await page.getByRole('button',{name:'Next matching line'}).click()
 await page.getByText(/2 of 2 matching lines/).waitFor()
 const textDownload=page.waitForEvent('download')
 await page.getByRole('button',{name:'Download assets/app.js'}).click()
 if((await readFile(await (await textDownload).path(),'utf8'))!==source)throw new Error('Source download changed bytes')
 await page.screenshot({path:OUT + '/batch-verified-source.png'})
 await page.getByRole('button',{name:'Clear file filters'}).click()
 await page.getByRole('button',{name:/^result.bin/}).click()
 const binaryDownload=page.waitForEvent('download')
 await page.getByRole('button',{name:'Download result.bin'}).click()
 if(!(await readFile(await (await binaryDownload).path())).equals(binary))throw new Error('Binary download changed bytes')
 await page.getByRole('button',{name:'Changes',exact:true}).click()
 const panel=page.locator('.pixel-workspace-changes')
 await panel.getByLabel('Filter changed files').fill('app.js')
 await panel.getByRole('button',{name:'Expand all changes'}).click()
 await panel.getByRole('region',{name:'Changes to assets/app.js'}).waitFor()
 await panel.getByRole('button',{name:'Collapse all changes'}).click()
 if(await panel.getByRole('region',{name:'Changes to assets/app.js'}).count())throw new Error('Collapse failed')
 await panel.getByRole('button',{name:'Clear change filters'}).click()
 await page.screenshot({path:OUT + '/batch-change-review.png'})
 console.log('Change filtering/expansion and verified source find, extension/size filters and byte-exact text/binary downloads passed together.')
}finally{await browser.close()}
