import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
BASE = 'http://127.0.0.1:44371/qa-quality.html'
receipts = []
def record(name, **data):
    receipts.append({'check': name, **data})
    (ROOT / 'artifacts/lifecycle-receipts.json').write_text(json.dumps(receipts, indent=2))
    print(name, data, flush=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    try:
        ctx = browser.new_context()
        first = ctx.new_page()
        second = ctx.new_page()
        for page in (first, second):
            page.goto(BASE + '?case=storage')
            page.wait_for_function('Boolean(window.qa)')
        second.evaluate('window.storageEvents=[]; addEventListener("storage",e=>storageEvents.push(e.key))')
        result = first.evaluate('''() => {
          qa.saveConversation({schema:1,chatId:'quota',messages:[{role:'user',content:'old'}],draft:''});
          let count=0;
          try { for (;;count++) localStorage.setItem('qa-fill-'+count,'x'.repeat(1024)); }
          catch(e) { if(e.name!=='QuotaExceededError') throw e; }
          for(let i=count-4;i<count;i++) localStorage.removeItem('qa-fill-'+i);
          let error;
          try { qa.saveConversation({schema:1,chatId:'quota',messages:[{role:'user',content:'NEW'+ 'y'.repeat(3000)}],draft:''}); }
          catch(e) { if(e.name!=='QuotaExceededError') throw e; error=e.name; }
          const current=JSON.parse(localStorage.getItem(qa.CHAT_KEY));
          const oldLibrary=JSON.parse(localStorage.getItem('ods.pixel.conversations.v1'));
          if(error!=='QuotaExceededError'||!current.messages[0].content.startsWith('NEW')||oldLibrary[0].messages[0].content!=='old') throw Error('Did not reach current-success/library-failure boundary');
          return {fillers:count,error,currentVersion:current.persistenceVersion,library:oldLibrary[0].messages[0].content};
        }''')
        second.wait_for_function('storageEvents.includes(qa.CHAT_KEY) && qa.readConversations()[0].messages[0].content.startsWith("NEW")')
        first.reload()
        first.wait_for_function('Boolean(window.qa) && qa.readConversations()[0].messages[0].content.startsWith("NEW")')
        first.evaluate('''() => {
          for(const key of Object.keys(localStorage)) if(key.startsWith('qa-fill-')) localStorage.removeItem(key);
          qa.saveConversation(qa.readConversations()[0]);
          if(!qa.legacy.readConversations()[0].messages[0].content.startsWith('NEW')) throw Error('Downgrade lost successful save');
        }''')
        record('actual browser quota partial save, second-tab receipt, reload, successful-save downgrade', **result)
        ctx.close()

        ctx = browser.new_context()
        page = ctx.new_page()
        page.goto(BASE + '?case=theme')
        page.wait_for_function('Boolean(window.qa?.theme)')
        page.evaluate('''async () => {
          const canvas=document.createElement('canvas'); canvas.width=160; canvas.height=90;
          const context=canvas.getContext('2d'); context.fillStyle='green'; context.fillRect(0,0,160,90);
          const stream=canvas.captureStream(10); const chunks=[];
          const recorder=new MediaRecorder(stream,{mimeType:'video/webm'});
          recorder.ondataavailable=e=>chunks.push(e.data);
          const stopped=new Promise(resolve=>recorder.onstop=resolve);
          recorder.start(); await new Promise(resolve=>setTimeout(resolve,500)); recorder.stop(); await stopped;
          stream.getTracks().forEach(track=>track.stop());
          window.videoFixture=new File(chunks,'qa-wallpaper.webm',{type:'video/webm'});
          await qa.theme.addWallpaper(videoFixture);
        }''')
        page.wait_for_function('document.querySelector("video")?.currentTime > 0')
        src = page.locator('video').get_attribute('src')
        page.evaluate('window.loads=0; document.querySelector("video").addEventListener("loadstart",()=>loads++); dispatchEvent(new Event("focus"))')
        page.wait_for_timeout(300)
        assert page.locator('video').get_attribute('src') == src
        assert page.evaluate('loads') == 0
        page.evaluate('qa.theme.setWallpaperMotion(false)')
        page.wait_for_function('document.querySelector("video").paused')
        page.evaluate('qa.theme.setWallpaperMotion(true)')
        page.wait_for_function('!document.querySelector("video").paused')
        page.evaluate('window.pendingImport=qa.theme.addWallpaper(new File([videoFixture],"second.webm",{type:"video/webm"})); qa.theme.setTheme("forest")')
        page.evaluate('pendingImport')
        page.wait_for_function('qa.theme.theme === "forest" && qa.theme.wallpapers.filter(item=>item.id.startsWith("custom-")).length === 2')
        record('actual WebM decode, focus retains Blob URL, pause/resume, later selection wins import', browser=browser.version)
        ctx.close()
    finally:
        browser.close()
