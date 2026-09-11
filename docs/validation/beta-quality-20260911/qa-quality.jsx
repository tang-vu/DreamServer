import React, {useState} from 'react'
import {createRoot} from 'react-dom/client'
import {MemoryRouter} from 'react-router-dom'
import {ThemeProvider,useTheme} from '/src/contexts/ThemeContext'
import Pixel from '/src/pages/Pixel'
import PixelPreviewSource from '/src/components/PixelPreviewSource'
import PixelPreviewViewport from '/src/components/PixelPreviewViewport'
import PixelPromptLibrary from '/src/components/PixelPromptLibrary'
import PixelTextFileInput from '/src/components/PixelTextFileInput'
import CustomWallpaperPicker from '/src/components/CustomWallpaperPicker'
import WallpaperVideo from '/src/components/WallpaperVideo'
import AssistantIdentitySettings from '/src/components/settings/AssistantIdentitySettings'
import {PortalIdentityProvider} from '/src/contexts/PortalIdentityContext'
import * as conversations from '/src/lib/pixelConversations'
import * as legacy from '/qa-legacy-conversations.js'
import * as wallpaperStore from '/src/lib/customWallpapers'
import '/src/index.css'
import '/src/pixel-workspace.css'
import '/src/wallpaper-themes.css'
import '/src/profile.css'

window.qa = {...conversations,legacy,wallpaperStore}
const params = new URLSearchParams(location.search)
const mode = params.get('case')
const source = window.__qaSource || '<h1>Verified</h1>\n'
const bytes = new TextEncoder().encode(source)
const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(value=>value.toString(16).padStart(2,'0')).join('')
const preview = {siteId:'site-'+'a'.repeat(24),entrySha256:digest}

function Gallery() {
  const theme = useTheme()
  window.qa.theme = theme
  return <><WallpaperVideo/><CustomWallpaperPicker/><button onClick={()=>theme.setTheme('forest')}>Select Forest</button><output>{theme.theme}</output></>
}
function Fixture() {
  const [draft,setDraft] = useState('Unsent draft')
  if (mode === 'conversation') return <Pixel/>
  if (mode === 'storage') return <p>Isolated persistence test</p>
  if (mode === 'theme') return <Gallery/>
  if (mode === 'identity') return <PortalIdentityProvider><AssistantIdentitySettings/></PortalIdentityProvider>
  if (mode === 'viewport') return <div style={{height:850}}><PixelPreviewViewport title="QA preview" hidden={false} access={{frameUrl:'/qa-frame.html',sandbox:'allow-scripts',route:'qa'}}/></div>
  if (mode === 'source') return <PixelPreviewSource preview={preview} file={params.get('file') ? {path:params.get('file'),sha256:digest,bytes:bytes.length} : undefined}/>
  return <><textarea aria-label="QA draft" value={draft} onChange={event=>setDraft(event.target.value)}/>
    {mode === 'prompts' ? <PixelPromptLibrary input={draft} disabled={false} onInsert={text=>setDraft(current=>current+'\n'+text)}/>
      : <PixelTextFileInput input={draft} disabled={false} limit={16384} onInsert={text=>setDraft(current=>current+text)}/>}</>
}
createRoot(document.getElementById('root')).render(<MemoryRouter><ThemeProvider><main style={{maxWidth:mode==='conversation'?undefined:760,margin:'0 auto',padding:12,color:'#ddd'}}><Fixture/></main></ThemeProvider></MemoryRouter>)
