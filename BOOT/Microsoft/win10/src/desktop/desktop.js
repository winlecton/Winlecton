/* ── WinLectron Win11 Desktop Engine ── */

const OS = 'win11';
const ACCENT = '#0067C0';

const APPS = [
  { id: 'explorer', name: 'File Explorer', emoji: '📁', pinned: true },
  { id: 'notepad',  name: 'Notepad',       emoji: '📝', pinned: true },
  { id: 'browser',  name: 'Edge',          emoji: '🌐', pinned: true },
  { id: 'settings', name: 'Settings',      emoji: '⚙️',  pinned: true },
  { id: 'terminal', name: 'Terminal',      emoji: '⌨️',  pinned: true },
  { id: 'store',    name: 'Microsoft Store','emoji':'🏪', pinned: true },
  { id: 'calc',     name: 'Calculator',    emoji: '🧮', pinned: false },
  { id: 'widgets',  name: 'Widgets',       emoji: '📊', pinned: false },
  { id: 'about',    name: 'About',         emoji: 'ℹ️',  pinned: false },
];

const DESKTOP_ICONS = [
  { id: 'pc',       name: 'This PC',       emoji: '🖥',  x: 16,  y: 16  },
  { id: 'recycle',  name: 'Recycle Bin',   emoji: '🗑',  x: 16,  y: 104 },
  { id: 'notepad',  name: 'Notepad',       emoji: '📝',  x: 16,  y: 192 },
  { id: 'terminal', name: 'Terminal',      emoji: '⌨️',  x: 16,  y: 280 },
];

let zTop = 600;
let openWindows = [];

function bringToFront(win) {
  win.style.zIndex = ++zTop;
  document.querySelectorAll('.window').forEach(w => w.classList.remove('focused'));
  win.classList.add('focused');
}

function makeDraggable(win, bar) {
  let ox, oy, mx, my;
  bar.addEventListener('mousedown', e => {
    e.preventDefault();
    ox = win.offsetLeft; oy = win.offsetTop; mx = e.clientX; my = e.clientY;
    document.onmousemove = ev => { win.style.left = (ox + ev.clientX - mx) + 'px'; win.style.top = (oy + ev.clientY - my) + 'px'; };
    document.onmouseup = () => { document.onmousemove = document.onmouseup = null; };
  });
}

function makeResizable(win) {
  const h = document.createElement('div');
  h.style.cssText = 'position:absolute;bottom:0;right:0;width:14px;height:14px;cursor:se-resize;border-radius:0 0 10px 0';
  win.appendChild(h);
  h.addEventListener('mousedown', e => {
    e.preventDefault();
    const sw = win.offsetWidth, sh = win.offsetHeight, sx = e.clientX, sy = e.clientY;
    document.onmousemove = ev => { win.style.width = Math.max(400, sw + ev.clientX - sx) + 'px'; win.style.height = Math.max(300, sh + ev.clientY - sy) + 'px'; };
    document.onmouseup = () => { document.onmousemove = document.onmouseup = null; };
  });
}

function openWindow(id) {
  closeStart();
  const existing = document.getElementById('win-' + id);
  if (existing) { bringToFront(existing); return; }

  const app = APPS.find(a => a.id === id) || { id, name: id, emoji: '📄' };
  const win = document.createElement('div');
  win.className = 'window focused';
  win.id = 'win-' + id;
  win.style.cssText = `left:${120 + openWindows.length * 28}px;top:${80 + openWindows.length * 28}px;width:680px;height:440px;`;

  win.innerHTML = `
    <div class="window-titlebar" id="tb-${id}">
      <span class="window-icon">${app.emoji}</span>
      <span class="window-title">${app.name}</span>
      <div class="window-controls">
        <div class="wc-btn" onclick="minimizeWin('${id}')">─</div>
        <div class="wc-btn" onclick="maximizeWin('${id}')">⬜</div>
        <div class="wc-btn close" onclick="closeWin('${id}')">✕</div>
      </div>
    </div>
    <div class="window-content" id="wc-${id}">${getWindowContent(id)}</div>`;

  document.body.appendChild(win);
  bringToFront(win);
  makeDraggable(win, win.querySelector(`#tb-${id}`));
  makeResizable(win);
  win.addEventListener('mousedown', () => bringToFront(win));
  openWindows.push(id);
  addTaskbarApp(app);
  if (id === 'calc') initCalc();
  if (id === 'widgets') initWidgets();
}

function closeWin(id) { document.getElementById('win-' + id)?.remove(); openWindows = openWindows.filter(w => w !== id); document.getElementById('tapp-' + id)?.remove(); }
function minimizeWin(id) { const w = document.getElementById('win-' + id); if (w) w.style.display = w.style.display === 'none' ? 'flex' : 'none'; }
function maximizeWin(id) {
  const w = document.getElementById('win-' + id); if (!w) return;
  if (w.dataset.max === '1') { w.style.cssText = w.dataset.prev; w.dataset.max = ''; }
  else { w.dataset.prev = w.style.cssText; w.style.cssText = 'left:0;top:0;width:100vw;height:calc(100vh - 48px);border-radius:0;'; w.dataset.max = '1'; }
}

function addTaskbarApp(app) {
  if (document.getElementById('tapp-' + app.id)) return;
  const btn = document.createElement('div');
  btn.className = 'taskbar-app active';
  btn.id = 'tapp-' + app.id;
  btn.title = app.name;
  btn.innerHTML = app.emoji;
  btn.onclick = () => { const w = document.getElementById('win-' + app.id); if (w) { if (w.style.display === 'none') { w.style.display = 'flex'; bringToFront(w); } else bringToFront(w); } };
  document.getElementById('taskbar-apps').appendChild(btn);
}

function getWindowContent(id) {
  switch (id) {
    case 'explorer': return explorerContent();
    case 'notepad':  return notepadContent();
    case 'browser':  return browserContent();
    case 'settings': return settingsContent();
    case 'terminal': return terminalContent();
    case 'calc':     return calcContent();
    case 'store':    return storeContent();
    case 'widgets':  return widgetsContent();
    case 'about':    return aboutContent();
    case 'teams':    return teamsContent();
    case 'copilot':  return copilotContent();
    case 'snip':     return snipContent();
    case 'edge':     return edgeContent();
    default: return `<p style="color:#aaa">App "${id}" coming soon.</p>`;
  }
}

function explorerContent() {
  return `<div style="display:flex;height:100%;gap:0">
    <div style="width:160px;background:rgba(0,0,0,0.2);border-right:1px solid rgba(255,255,255,0.06);padding:12px 8px;font-size:12px;">
      ${[['🏠','Home'],['📌','Quick Access'],['💻','This PC'],['🌐','Network'],['☁️','OneDrive']].map(([e,n])=>`
        <div style="padding:6px 8px;border-radius:6px;cursor:pointer;display:flex;align-items:center;gap:8px;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background=''">${e} ${n}</div>`).join('')}
    </div>
    <div style="flex:1;padding:16px">
      <div style="font-size:11px;color:#777;margin-bottom:16px;display:flex;align-items:center;gap:4px">
        <span style="background:rgba(255,255,255,0.07);padding:2px 8px;border-radius:4px;cursor:pointer">This PC</span> › 
        <span style="background:rgba(255,255,255,0.07);padding:2px 8px;border-radius:4px;cursor:pointer">Documents</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:8px">
        ${['Documents','Downloads','Desktop','Pictures','Music','Videos','Projects'].map(n=>`
          <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 4px;border-radius:8px;cursor:pointer;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background=''">
            <span style="font-size:28px">📁</span><span style="font-size:10px;text-align:center">${n}</span>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function notepadContent() {
  return `<div style="height:100%;display:flex;flex-direction:column">
    <div style="display:flex;gap:12px;font-size:12px;padding:4px 0 8px;border-bottom:1px solid rgba(255,255,255,0.07);margin-bottom:8px;color:#ccc">
      ${['File','Edit','View'].map(m=>`<span style="cursor:pointer;padding:3px 8px;border-radius:5px;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background=''">${m}</span>`).join('')}
    </div>
    <textarea style="flex:1;background:rgba(255,255,255,0.03);border:none;color:#fff;font-family:'Cascadia Code','Consolas',monospace;font-size:13px;resize:none;outline:none;border-radius:6px;padding:8px;" placeholder="Start typing..."></textarea>
  </div>`;
}

function browserContent() {
  return `<div style="height:100%;display:flex;flex-direction:column;gap:8px">
    <div style="display:flex;align-items:center;gap:6px">
      ${['←','→','↺'].map(s=>`<button style="background:rgba(255,255,255,0.07);border:none;color:#fff;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:13px">${s}</button>`).join('')}
      <div style="flex:1;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:5px 14px;font-size:12px;color:#aaa">🔒 &nbsp;winlectron.app</div>
    </div>
    <div style="flex:1;background:rgba(255,255,255,0.03);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;color:#666">
      <span style="font-size:40px">🌐</span>
      <span style="font-size:14px">Browser sandbox — Electron webview not available in preview</span>
    </div>
  </div>`;
}

function settingsContent() {
  const cats = [['🎨','Personalization','Colors, lock screen, themes'],['🔊','Sound','Volume, output, input'],['🌐','Network','Wi-Fi, Ethernet, VPN'],['🔒','Privacy & Security','Permissions, Windows Security'],['🔄','Windows Update','Latest updates for Win11'],['ℹ️','System','About, display, power']];
  return `<div style="display:flex;height:100%">
    <div style="width:180px;border-right:1px solid rgba(255,255,255,0.06);padding:8px;font-size:12px">
      ${cats.map(([e,n])=>`<div style="padding:8px 10px;border-radius:6px;cursor:pointer;display:flex;align-items:center;gap:8px;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background=''">${e} ${n}</div>`).join('')}
    </div>
    <div style="flex:1;padding:20px">
      <h3 style="font-size:20px;font-weight:400;margin-bottom:20px">System</h3>
      ${[['🖥','Display','Screen resolution & scaling'],['🔊','Sound','Audio settings'],['🔔','Notifications','App alerts'],['⚡','Power','Sleep & battery saver']].map(([e,n,d])=>`
        <div style="display:flex;align-items:center;gap:14px;padding:14px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);margin-bottom:8px;cursor:pointer;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background=''">
          <span style="font-size:22px;background:rgba(0,103,192,0.25);padding:8px;border-radius:8px">${e}</span>
          <div><div style="font-size:13px;margin-bottom:2px">${n}</div><div style="font-size:11px;color:#777">${d}</div></div>
          <span style="margin-left:auto;color:#666">›</span>
        </div>`).join('')}
    </div>
  </div>`;
}

function terminalContent() {
  return `<div style="background:#0c0c0c;height:100%;border-radius:6px;padding:12px;font-family:'Cascadia Code','Consolas',monospace;font-size:13px;color:#cccccc;display:flex;flex-direction:column;">
    <div style="display:flex;gap:8px;margin-bottom:8px;border-bottom:1px solid #222;padding-bottom:8px">
      <span style="color:#ccc;font-size:12px;cursor:pointer;padding:2px 8px;background:#1e1e1e;border-radius:4px">PowerShell</span>
      <span style="color:#777;font-size:18px;cursor:pointer;margin-left:auto">+</span>
    </div>
    <div id="term-output" style="flex:1;overflow-y:auto;white-space:pre-wrap;line-height:1.7">Windows PowerShell 7.4.0
Copyright (C) Microsoft Corporation.

<span style="color:#4ec9b0">PS</span> <span style="color:#ce9178">C:\\Users\\User</span><span style="color:#fff">&gt;</span> </div>
    <div style="display:flex;align-items:center;gap:6px;margin-top:8px;border-top:1px solid #1a1a1a;padding-top:8px">
      <span style="color:#4ec9b0;font-size:12px">PS</span><span style="color:#ce9178;font-size:12px">C:\\Users\\User&gt;</span>
      <input id="term-input" style="flex:1;background:transparent;border:none;color:#ccc;font-family:'Cascadia Code','Consolas',monospace;font-size:13px;outline:none" autofocus/>
    </div>
  </div>`;
}

function calcContent() {
  return `<div id="calc-app" style="display:flex;flex-direction:column;gap:8px;max-width:240px;margin:auto">
    <div style="font-size:10px;color:#666;text-align:right;height:16px" id="calc-history"></div>
    <div id="calc-display" style="background:transparent;padding:8px 4px;text-align:right;font-size:36px;font-weight:300;min-height:60px;word-break:break-all;color:#fff">0</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px" id="calc-buttons"></div>
  </div>`;
}

function storeContent() {
  const apps = [['🎮','Xbox Game Bar'],['📸','Camera'],['🎵','Groove Music'],['🗺️','Maps'],['📰','News'],['🌤️','Weather'],['✂️','Snipping Tool'],['🖩','Calculator']];
  return `<div style="height:100%;overflow-y:auto">
    <div style="background:linear-gradient(135deg,#003a82,#0067C0);border-radius:8px;padding:24px;margin-bottom:20px">
      <div style="font-size:18px;font-weight:300;margin-bottom:4px">Microsoft Store</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.7)">Apps, games, and more for Windows 11</div>
    </div>
    <div style="font-size:12px;color:#777;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px">Featured Apps</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
      ${apps.map(([e,n])=>`
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:16px;text-align:center;cursor:pointer;" onmouseover="this.style.background='rgba(255,255,255,0.09)'" onmouseout="this.style.background='rgba(255,255,255,0.04)'">
          <div style="font-size:32px;margin-bottom:8px">${e}</div>
          <div style="font-size:11px;margin-bottom:8px">${n}</div>
          <button style="background:rgba(0,103,192,0.7);border:none;color:#fff;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:11px">Get</button>
        </div>`).join('')}
    </div>
  </div>`;
}

function widgetsContent() {
  return `<div id="widgets-content" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;height:100%;overflow-y:auto">
    <div style="background:rgba(0,103,192,0.2);border:1px solid rgba(0,103,192,0.3);border-radius:12px;padding:16px">
      <div style="font-size:11px;color:#aaa;margin-bottom:8px">⛅ WEATHER</div>
      <div style="font-size:40px;font-weight:300" id="w-temp">—°C</div>
      <div style="font-size:12px;color:#aaa" id="w-desc">Loading...</div>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px">
      <div style="font-size:11px;color:#aaa;margin-bottom:8px">🕒 CLOCK</div>
      <div style="font-size:32px;font-weight:300" id="w-clock">--:--</div>
      <div style="font-size:12px;color:#aaa" id="w-date">...</div>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;grid-column:span 2">
      <div style="font-size:11px;color:#aaa;margin-bottom:8px">📰 NEWS</div>
      ${['Electron.js reaches v30 — new APIs and features','Microsoft announces Windows 12 preview','GitHub Copilot updated with GPT-5 backend'].map(h=>`
        <div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:12px;cursor:pointer;">${h}</div>`).join('')}
    </div>
  </div>`;
}

function aboutContent() {
  return `<div style="text-align:center;padding:24px">
    <svg viewBox="0 0 88 88" xmlns="http://www.w3.org/2000/svg" width="56" style="margin-bottom:12px">
      <rect x="2" y="2" width="38" height="38" fill="#0067C0" rx="6"/>
      <rect x="48" y="2" width="38" height="38" fill="#0067C0" rx="6"/>
      <rect x="2" y="48" width="38" height="38" fill="#0067C0" rx="6"/>
      <rect x="48" y="48" width="38" height="38" fill="#0067C0" rx="6"/>
    </svg>
    <h2 style="font-size:22px;font-weight:300;margin-bottom:4px">WinLectron</h2>
    <p style="color:#777;font-size:12px;margin-bottom:20px">Windows 11 Simulator · Built with Electron.js</p>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:16px;text-align:left;font-size:12px;line-height:2.2">
      <div>🪟 &nbsp;Edition: Windows 11 Pro (Simulated)</div>
      <div>🔢 &nbsp;Version: 23H2 · Build 22631</div>
      <div>⚡ &nbsp;Engine: Electron v28</div>
      <div>📦 &nbsp;WinLectron: v1.0.0</div>
      <div>📜 &nbsp;License: MIT</div>
    </div>
  </div>`;
}

function teamsContent() {
  return `<div style="display:flex;height:100%">
    <div style="width:60px;background:rgba(0,0,0,0.3);display:flex;flex-direction:column;align-items:center;padding:12px 0;gap:12px;border-right:1px solid rgba(255,255,255,0.06)">
      ${[['💬','Chat'],['👥','Teams'],['📅','Calendar'],['📁','Files'],['📞','Calls']].map(([e,t])=>`<div title="${t}" style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:8px;cursor:pointer;font-size:20px;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background=''">${e}</div>`).join('')}
    </div>
    <div style="width:220px;border-right:1px solid rgba(255,255,255,0.06);padding:12px;overflow-y:auto">
      <div style="font-size:11px;color:#777;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Recent</div>
      ${[['🟢','General','Hey everyone!'],['🟡','Dev Team','Build passing ✅'],['🔵','Design','New mockups ready'],['⚪','WinLectron','Check the latest commit']].map(([dot,name,msg])=>`
        <div style="padding:8px;border-radius:8px;cursor:pointer;margin-bottom:4px;" onmouseover="this.style.background='rgba(255,255,255,0.07)'" onmouseout="this.style.background=''">
          <div style="display:flex;align-items:center;gap:6px;font-size:12px;margin-bottom:2px">${dot} <b>${name}</b></div>
          <div style="font-size:11px;color:#777;padding-left:16px">${msg}</div>
        </div>`).join('')}
    </div>
    <div style="flex:1;padding:16px;display:flex;flex-direction:column">
      <div style="border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:10px;margin-bottom:12px;font-size:14px;font-weight:500">💬 General</div>
      <div style="flex:1;display:flex;flex-direction:column;gap:10px;overflow-y:auto;font-size:12px">
        ${[['Alice','Hey team, WinLectron is looking amazing!'],['Bob','Agreed! The Win11 UI is 🔥'],['You','Thanks! Working on the Teams app now 😄']].map(([n,m])=>`
          <div style="display:flex;gap:8px;align-items:flex-start">
            <div style="width:28px;height:28px;border-radius:50%;background:rgba(0,103,192,0.5);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px">${n[0]}</div>
            <div><div style="color:#aaa;font-size:10px;margin-bottom:2px">${n}</div><div style="background:rgba(255,255,255,0.05);padding:6px 10px;border-radius:0 8px 8px 8px;">${m}</div></div>
          </div>`).join('')}
      </div>
      <div style="display:flex;gap:8px;margin-top:12px">
        <input placeholder="Type a message..." style="flex:1;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:8px 12px;color:#fff;font-size:12px;outline:none"/>
        <button style="background:#0067C0;border:none;color:#fff;padding:8px 14px;border-radius:6px;cursor:pointer">➤</button>
      </div>
    </div>
  </div>`;
}

function copilotContent() {
  return `<div style="display:flex;flex-direction:column;height:100%;background:linear-gradient(160deg,rgba(0,40,80,0.3),rgba(0,0,0,0))">
    <div style="text-align:center;padding:24px 0 16px">
      <div style="font-size:36px;margin-bottom:6px">🤖</div>
      <div style="font-size:18px;font-weight:300">Copilot</div>
      <div style="font-size:11px;color:#666;margin-top:2px">Your everyday AI companion</div>
    </div>
    <div style="flex:1;overflow-y:auto;padding:0 16px;display:flex;flex-direction:column;gap:10px" id="copilot-msgs">
      <div style="background:rgba(0,103,192,0.15);border:1px solid rgba(0,103,192,0.25);border-radius:12px;padding:12px 14px;font-size:13px">
        👋 Hi! I'm Copilot. Ask me anything — writing, coding, questions, and more.
      </div>
    </div>
    <div style="padding:12px 16px;display:flex;gap:8px;border-top:1px solid rgba(255,255,255,0.06)">
      <input id="copilot-input" placeholder="Ask me anything..." style="flex:1;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:9px 16px;color:#fff;font-size:13px;outline:none" onkeydown="if(event.key==='Enter') sendCopilot()"/>
      <button onclick="sendCopilot()" style="background:#0067C0;border:none;color:#fff;width:38px;height:38px;border-radius:50%;cursor:pointer;font-size:16px">➤</button>
    </div>
  </div>`;
}

function snipContent() {
  return `<div style="display:flex;flex-direction:column;height:100%;gap:10px">
    <div style="display:flex;gap:8px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.07);flex-wrap:wrap">
      ${[['⬜','Rectangle'],['⭕','Freeform'],['🪟','Window'],['🖥','Full screen']].map(([e,n])=>`
        <button style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);color:#fff;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:12px;">${e} ${n}</button>`).join('')}
      <button style="background:#0067C0;border:none;color:#fff;padding:5px 14px;border-radius:6px;cursor:pointer;font-size:12px;margin-left:auto">📸 New Snip</button>
    </div>
    <div style="flex:1;background:rgba(255,255,255,0.03);border:2px dashed rgba(255,255,255,0.1);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;color:#555">
      <span style="font-size:40px">✂️</span>
      <span style="font-size:13px">Click "New Snip" to capture a screenshot</span>
      <span style="font-size:11px;color:#444">Snipping Tool — WinLectron Edition</span>
    </div>
    <div style="display:flex;gap:6px;justify-content:center;padding:4px 0;border-top:1px solid rgba(255,255,255,0.06)">
      ${[['✏️','Draw'],['🔲','Rect'],['🖊','Highlight'],['🗑','Erase']].map(([e,n])=>`
        <button style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);color:#fff;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:12px;">${e} ${n}</button>`).join('')}
    </div>
  </div>`;
}

function edgeContent() {
  const bookmarks = [['🔍','Google'],['📺','YouTube'],['🐙','GitHub'],['📰','News']];
  return `<div style="display:flex;flex-direction:column;height:100%;gap:8px">
    <div style="display:flex;align-items:center;gap:6px">
      ${['←','→','↺'].map(s=>`<button style="background:rgba(255,255,255,0.07);border:none;color:#fff;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:13px">${s}</button>`).join('')}
      <div style="flex:1;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:5px 14px;font-size:12px;color:#aaa;display:flex;align-items:center;gap:6px">
        🔒 <span>winlectron://newtab</span>
      </div>
      <button style="background:rgba(255,255,255,0.07);border:none;color:#fff;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:13px">⋯</button>
    </div>
    <div style="flex:1;background:rgba(10,10,20,0.5);border-radius:8px;overflow:hidden;display:flex;flex-direction:column">
      <div style="padding:20px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06)">
        <div style="font-size:22px;font-weight:300;margin-bottom:4px">🌐 Winlectron Edge</div>
        <div style="font-size:11px;color:#666">Your simulated browser — powered by WinLectron</div>
      </div>
      <div style="padding:16px">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#666;margin-bottom:10px">Favourites</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
          ${bookmarks.map(([e,n])=>`
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:14px 8px;text-align:center;cursor:pointer;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
              <div style="font-size:24px;margin-bottom:6px">${e}</div>
              <div style="font-size:11px;color:#aaa">${n}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

function sendCopilot() {
  const input = document.getElementById('copilot-input');
  const msgs  = document.getElementById('copilot-msgs');
  if (!input || !msgs || !input.value.trim()) return;
  const q = input.value.trim();
  msgs.innerHTML += `<div style="text-align:right"><span style="background:rgba(0,103,192,0.4);border-radius:12px 12px 0 12px;padding:8px 14px;font-size:13px;display:inline-block">${q}</span></div>`;
  input.value = '';
  msgs.scrollTop = msgs.scrollHeight;
  setTimeout(() => {
    const replies = ['That\'s a great question! Let me think...','I can help with that! Here\'s what I know...','In WinLectron, anything is possible 🚀','Sure! As your AI companion, I\'d suggest...'];
    msgs.innerHTML += `<div style="background:rgba(0,103,192,0.15);border:1px solid rgba(0,103,192,0.25);border-radius:12px;padding:10px 14px;font-size:13px">${replies[Math.floor(Math.random()*replies.length)]}</div>`;
    msgs.scrollTop = msgs.scrollHeight;
  }, 600);
}

function initCalc() {
  const btns = [['C','⌫','%','÷'],['7','8','9','×'],['4','5','6','−'],['1','2','3','+'],['0','.','=','']];
  const grid = document.getElementById('calc-buttons');
  if (!grid) return;
  let expr = '';
  const display = document.getElementById('calc-display');
  const history = document.getElementById('calc-history');

  btns.flat().forEach(label => {
    if (!label) return;
    const btn = document.createElement('button');
    btn.textContent = label;
    const isAccent = label === '=';
    const isOp = ['÷','×','−','+','C','⌫','%'].includes(label);
    btn.style.cssText = `background:${isAccent ? '#0067C0' : isOp ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)'};border:none;color:#fff;padding:14px;border-radius:8px;font-size:16px;cursor:pointer;transition:background 0.1s;`;
    btn.onmouseover = () => btn.style.opacity = '0.8';
    btn.onmouseout  = () => btn.style.opacity = '1';
    btn.addEventListener('click', () => {
      if (label === 'C')  { expr = ''; display.textContent = '0'; history.textContent = ''; }
      else if (label === '⌫') { expr = expr.slice(0, -1); display.textContent = expr || '0'; }
      else if (label === '=') {
        try { const res = eval(expr.replace('×','*').replace('÷','/').replace('−','-')); history.textContent = expr + ' ='; display.textContent = res; expr = String(res); }
        catch { display.textContent = 'Error'; expr = ''; }
      } else if (label === '%') {
        try { display.textContent = parseFloat(eval(expr)) / 100; expr = String(display.textContent); } catch {}
      } else { expr += label; display.textContent = expr; }
    });
    grid.appendChild(btn);
  });
}

function initWidgets() {
  const wc = document.getElementById('w-clock');
  const wd = document.getElementById('w-date');
  const wt = document.getElementById('w-temp');
  const wdesc = document.getElementById('w-desc');
  if (wt) { wt.textContent = '18°C'; wdesc.textContent = 'Partly Cloudy · Warsaw'; }
  function tick() {
    if (!wc) return;
    const n = new Date();
    wc.textContent = n.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    wd.textContent = n.toLocaleDateString([], {weekday:'long',month:'long',day:'numeric'});
  }
  tick(); setInterval(tick, 1000);
}

// ── Terminal
document.addEventListener('keydown', e => {
  const input = document.getElementById('term-input');
  if (!input || document.activeElement !== input) return;
  if (e.key === 'Enter') {
    const cmd = input.value.trim();
    const out  = document.getElementById('term-output');
    const cmds = { help:'Available: help, ver, whoami, date, clear, winver, exit', ver:'WinLectron PowerShell 7.4.0', whoami:'WINLECTRON\\User', date: new Date().toString(), winver:'Windows 11 Version 23H2 (Build 22631)', clear:'__clear__', exit:'__exit__' };
    if (cmd === 'clear') out.innerHTML = '<span style="color:#4ec9b0">PS</span> <span style="color:#ce9178">C:\\Users\\User</span><span style="color:#fff">&gt;</span> ';
    else if (cmd === 'exit') closeWin('terminal');
    else {
      const reply = cmds[cmd] || (cmd.startsWith('echo ') ? cmd.slice(5) : `The term '${cmd}' is not recognized.`);
      out.innerHTML += cmd + '\n' + reply + '\n<span style="color:#4ec9b0">PS</span> <span style="color:#ce9178">C:\\Users\\User</span><span style="color:#fff">&gt;</span> ';
    }
    input.value = ''; out.scrollTop = out.scrollHeight;
  }
});

// ── Desktop icons
function initDesktop() {
  const desk = document.getElementById('desktop');
  DESKTOP_ICONS.forEach(ic => {
    const el = document.createElement('div');
    el.className = 'icon';
    el.style.left = ic.x + 'px'; el.style.top = ic.y + 'px';
    el.innerHTML = `<span>${ic.emoji}</span><span>${ic.name}</span>`;
    el.addEventListener('dblclick', () => openWindow(ic.id));
    el.addEventListener('click', e => { document.querySelectorAll('.icon').forEach(i => i.classList.remove('selected')); el.classList.add('selected'); e.stopPropagation(); });
    desk.appendChild(el);
  });
  document.addEventListener('click', () => document.querySelectorAll('.icon').forEach(i => i.classList.remove('selected')));
}

// ── Start Menu
function toggleStart() { const sm = document.getElementById('start-menu'); sm.classList.toggle('open'); if (sm.classList.contains('open')) populateStart(); }
function closeStart() { document.getElementById('start-menu')?.classList.remove('open'); }
function populateStart() {
  const p = document.getElementById('start-pinned'); const a = document.getElementById('start-all');
  if (p.innerHTML) return;
  APPS.forEach(app => {
    const el = document.createElement('div'); el.className = 'start-app';
    el.innerHTML = `<div class="start-app-icon">${app.emoji}</div><span>${app.name}</span>`;
    el.onclick = () => openWindow(app.id);
    (app.pinned ? p : a).appendChild(el);
  });
}

// ── Context Menu
document.addEventListener('contextmenu', e => {
  e.preventDefault();
  const cm = document.getElementById('context-menu');
  cm.style.left = e.clientX + 'px'; cm.style.top = Math.min(e.clientY, window.innerHeight - 220) + 'px';
  cm.classList.add('show');
});
document.addEventListener('click', () => document.getElementById('context-menu')?.classList.remove('show'));

// ── Clock
function updateClock() {
  const n = new Date();
  document.getElementById('clock').innerHTML = `${n.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}<br>${n.toLocaleDateString([],{month:'numeric',day:'numeric',year:'numeric'})}`;
}

initDesktop();
updateClock();
setInterval(updateClock, 10000);