"""Isolated Chromium QA for the frozen beta integration; no live services."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parent
ARTIFACTS = ROOT / 'artifacts'
ARTIFACTS.mkdir(exist_ok=True)
BASE = 'http://127.0.0.1:44371/qa-quality.html'
SOURCE = '<main>' + 'long-unbroken-source'.__mul__(100) + '</main>\r\nTARGET second\r\nlast target\r\n'
receipts = []


def record(name, **details):
    receipts.append({'check': name, **details})
    (ARTIFACTS / 'browser-receipts.json').write_text(json.dumps(receipts, indent=2), encoding='utf-8')
    print(name, details, flush=True)


def context(browser, width=1280):
    result = browser.new_context(viewport={'width': width, 'height': 900}, accept_downloads=True,
                                 permissions=['clipboard-read', 'clipboard-write'])
    result.add_init_script('window.__qaSource = ' + json.dumps(SOURCE))
    result.route('**/pixel-preview/**', lambda route: route.fulfill(status=200, content_type='text/plain', body=SOURCE.encode()))
    result.route('**/qa-frame.html', lambda route: route.fulfill(status=200, content_type='text/html', body='<script>window.bootMarker=Math.random();</script><p>Isolated responsive fixture</p>'))
    result.route('**/api/**', lambda route: route.fulfill(status=200, json={'available':True,'model':'pixel/default'}))
    return result


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    record('browser', version=browser.version)
    try:
        for width in (1280, 390):
            ctx = context(browser, width)
            page = ctx.new_page()
            page.goto(BASE + '?case=source&file=README')
            toggle = page.get_by_role('button', name='Wrap lines', exact=True)
            expect(toggle).to_be_visible()
            code = page.get_by_label('Code for README', exact=True)
            before = code.evaluate('(el)=>({width:el.clientWidth,scroll:el.scrollWidth})')
            assert before['scroll'] > before['width'] * 2, before
            toggle.click()
            after = code.evaluate('(el)=>({width:el.clientWidth,scroll:el.scrollWidth})')
            assert after['scroll'] <= after['width'] + 2, after
            assert code.text_content() == SOURCE
            assert page.locator('[data-line]').count() == 3
            page.get_by_label('Find in source', exact=True).fill('target')
            expect(page.get_by_role('status')).to_contain_text('2 matching lines')
            page.get_by_role('checkbox', name='Match case').check()
            expect(page.get_by_role('status')).to_contain_text('1 matching lines')
            page.get_by_role('spinbutton', name='Go to source line').fill('2')
            page.get_by_role('button', name='Go to line', exact=True).click()
            expect(page.locator('[data-source-find-current]')).to_have_attribute('data-line','2')
            page.get_by_role('button', name='Copy code').click()
            assert page.evaluate('navigator.clipboard.readText()') == SOURCE
            with page.expect_download() as downloading:
                page.get_by_role('button', name='Download README').click()
            downloaded = ARTIFACTS / f'readme-{width}.txt'
            downloading.value.save_as(downloaded)
            assert downloaded.read_bytes() == SOURCE.encode()
            page.screenshot(path=str(ARTIFACTS / f'source-wrap-{width}.png'), full_page=True)
            record('verified source layout/copy/download', width=width, before=before, after=after, bytes=len(SOURCE.encode()))
            ctx.close()

        ctx = context(browser)
        page = ctx.new_page()
        page.goto(BASE + '?case=viewport')
        frame = page.frame_locator('iframe')
        expect(frame.get_by_text('Isolated responsive fixture')).to_be_visible()
        marker = frame.locator('html').evaluate('()=>window.bootMarker')
        page.get_by_label('Preview viewport size').select_option('custom')
        page.get_by_label('Viewport width').fill('1023')
        page.get_by_label('Viewport height').fill('900')
        page.get_by_role('button',name='Apply viewport').click()
        dimensions = frame.locator('html').evaluate('()=>[innerWidth,innerHeight]')
        assert dimensions == [1023,900], dimensions
        page.get_by_label('Viewport width').fill('')
        expect(page.get_by_role('button',name='Apply viewport')).to_be_disabled()
        page.get_by_role('button',name='Rotate viewport').click()
        assert frame.locator('html').evaluate('()=>[innerWidth,innerHeight]') == [900,1023]
        assert frame.locator('html').evaluate('()=>window.bootMarker') == marker
        page.screenshot(path=str(ARTIFACTS / 'custom-viewport.png'),full_page=True)
        record('actual iframe dimensions and retained execution', dimensions=dimensions)
        ctx.close()

        ctx = context(browser,390)
        page = ctx.new_page()
        page.goto(BASE + '?case=file')
        contents = '<script>neverExecute()</script>\r\nUnicode: Vi\u1ec7t\r\n'
        page.get_by_label('Choose text file',exact=True).set_input_files({'name':'review.html','mimeType':'text/html','buffer':contents.encode()})
        preview = page.get_by_role('region',name='Local file contents')
        expect(preview).to_be_visible()
        assert preview.text_content() == contents
        assert page.locator('script').filter(has_text='neverExecute').count() == 0
        expect(page.get_by_label('QA draft')).to_have_value('Unsent draft')
        page.screenshot(path=str(ARTIFACTS / 'local-file-review-mobile.png'),full_page=True)
        page.get_by_role('button',name='Insert file text').click()
        assert contents.replace('\r\n','\n') in page.get_by_label('QA draft').input_value()
        record('local file review and explicit insertion', bytes=len(contents.encode()))
        ctx.close()

        ctx = context(browser,390)
        page = ctx.new_page()
        page.goto(BASE + '?case=prompts')
        page.evaluate("localStorage.setItem('ods.pixel.saved-prompts.v1',JSON.stringify([{id:'review',title:'Review',text:'x'.repeat(180)+' Narrow regression'},{id:'deploy',title:'Deploy',text:'Inspect logs'}]))")
        page.get_by_role('button',name='Saved prompts',exact=True).click()
        page.get_by_label('Search saved prompts').fill('REGRESSION')
        expect(page.get_by_role('button',name='Insert prompt: Review')).to_be_visible()
        expect(page.get_by_role('button',name='Insert prompt: Deploy')).to_have_count(0)
        expect(page.get_by_label('QA draft')).to_have_value('Unsent draft')
        page.screenshot(path=str(ARTIFACTS / 'prompt-search-mobile.png'),full_page=True)
        record('native prompt dialog and full-text filtering')
        ctx.close()

        ctx = context(browser)
        state = {'schemaVersion':1,'revision':1,'displayName':'Old'}
        ctx.route('**/api/pixel/identity', lambda route: route.fulfill(status=200,json=state))
        page = ctx.new_page()
        page.goto(BASE + '?case=identity')
        name = page.get_by_label('Assistant display name')
        expect(name).to_have_value('Old')
        name.fill('My draft')
        state.update(revision=2,displayName='Other operator')
        page.get_by_role('button',name='Refresh saved name').click()
        expect(page.get_by_text('Last confirmed name: Other operator')).to_be_visible()
        expect(name).to_have_value('My draft')
        page.get_by_role('button',name='Use saved name').click()
        expect(name).to_have_value('Other operator')
        record('identity refresh preserves draft until explicit adoption')
        ctx.close()

        ctx = context(browser,390)
        page = ctx.new_page()
        page.goto(BASE + '?case=storage')
        page.wait_for_function('Boolean(window.qa)')
        page.evaluate("qa.saveConversation({schema:1,chatId:'browser-find',messages:Array.from({length:60},(_,i)=>({role:i%2?'assistant':'user',content:'Repeated evidence '+i})),draft:'Keep my draft'})")
        page.goto(BASE + '?case=conversation')
        expect(page.get_by_text('Available',exact=True)).to_be_visible()
        page.get_by_label('Chat options',exact=True).click()
        page.get_by_role('button',name='Find in this conversation',exact=True).click()
        dialog = page.get_by_role('dialog',name='Find in this conversation')
        dialog.get_by_label('Search message text').fill('evidence')
        expect(dialog.get_by_role('button',name='Go to prompt message 1',exact=True)).to_be_visible()
        page.screenshot(path=str(ARTIFACTS / 'conversation-find-mobile.png'),full_page=True)
        dialog.get_by_role('button',name='Next results').click()
        dialog.get_by_role('button',name='Go to reply message 26').click()
        expect(page.locator('[data-pixel-message-index="25"]')).to_be_focused()
        expect(page.get_by_placeholder('Message Portal...')).to_have_value('Keep my draft')
        record('native conversation search pagination and actual message focus')
        ctx.close()
    finally:
        browser.close()
