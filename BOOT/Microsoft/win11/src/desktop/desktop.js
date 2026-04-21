/* ══════════════════════════════════════
   WinLectron — Windows 11 Desktop Engine
   Fluent Design, rounded, centered taskbar
   ══════════════════════════════════════ */

const ACCENT = '#0067C0';

const APPS = [
  { id: 'explorer', name: 'File Explorer',   emoji: '📁', pinned: true  },
  { id: 'notepad',  name: 'Notepad',         emoji: '📝', pinned: true  },
  { id: 'browser',  name: 'Edge',            emoji: '🌐', pinned: true  },
  { id: 'settings', name: 'Settings',        emoji: '⚙️',  pinned: true  },
  { id: 'terminal', name: 'Terminal',        emoji: '⌨️',  pinned: true  },
  { id: 'store',    name: 'Microsoft Store', emoji: '🛒', pinned: true  },
  { id: 'teams',    name: 'Microsoft Teams', emoji: '💬', pinned: true  },
  { id: 'copilot',  name: 'Copilot',         emoji: '🤖', pinned: false },
  { id: 'calc',     name: 'Calculator',      emoji: '🧮', pinned: false },
  { id: 'photos',   name: 'Photos',          emoji: '🖼',  pinned: false },
  { id: 'snip',     name: 'Snipping Tool',   emoji: '✂️',  pinned: false },
  { id: 'about',    name: 'About',           emoji: 'ℹ️',  pinned: false },
];

const DESKTOP_ICONS = [
  { id: 'pc',       name: 'This PC',       emoji: '🖥',  x: 14, y: 14  },
  { id: 'recycle',  name: 'Recycle Bin',   emoji: '🗑',  x: 14, y: 102 },
  { id: 'notepad',  name: 'Notepad',       emoji: '📝',  x: 14, y: 190 },
  { id: 'terminal', name: 'Terminal',      emoji: '⌨️',  x: 14, y: 278 },
];

/* ── Window Manager ── */
let zTop = 500;
let openWins = [];

function bringToFront(win) {
  zTop++;
  win.style.zIndex = zTop;
  document.querySelectorAll('.win').forEach(w => w.classList.remove('focused'));
  win.classList.add('focused');
}

function makeDraggable(win, bar) {
  let ox, oy, mx, my, dragging = false;
  bar.addEventListener('mousedown', e => {
    if (e.target.closest('.win-controls')) return;
    dragging = true;
    ox = win.offsetLeft; oy = win.offsetTop;
    mx = e.clientX; my = e.clientY;
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    win.style.left = Math.max(0, ox + e.clientX - mx) + 'px';
    win.style.top  = Math.max(0, oy + e.clientY - my) + 'px';
  });
  document.addEventListener('mouseup', () => { dragging = false; });
}

function makeResizable(win) {
  const h = document.createElement('div');
  h.style.cssText = 'position:absolute;bottom:0;right:0;width:16px;height:16px;cursor:se-resize;z-index:10;border-radius:0 0 10px 0;';
  win.appendChild(h);
  h.addEventListener('mousedown', e => {
    e.preventDefault(); e.stopPropagation();
    const sw = win.offsetWidth, sh = win.offsetHeight, sx = e.clientX, sy = e.clientY;
    const mm = ev => {
      win.style.width  = Math.max(420, sw + ev.clientX - sx) + 'px';
      win.style.height = Math.max(300, sh + ev.clientY - sy) + 'px';
    };
    const mu = () => { document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); };
    document.addEventListener('mousemove', mm);
    document.addEventListener('mouseup', mu);
  });
}

function openWindow(id) {
  closeStart(); closeNotif();
  const existing = document.getElementById('win-' + id);
  if (existing) {
    if (existing.style.display === 'none') existing.style.display = 'flex';
    bringToFront(existing); return;
  }
  const app = APPS.find(a => a.id === id) || { id, name: id, emoji: '📄' };
  const win = document.createElement('div');
  win.className = 'win'; win.id = 'win-' + id;
  const offset = openWins.length * 28;
  win.style.cssText = `left:${100 + offset}px;top:${70 + offset}px;width:720px;height:460px;`;

  win.innerHTML = `
    <div class="win-titlebar" id="tb-${id}">
      <span class="win-titlebar-icon">${app.emoji}</span>
      <span class="win-title">${app.name}</span>
      <div class="win-controls">
        <div class="wc" onclick="minimizeWin('${id}')" title="Minimise">─</div>
        <div class="wc" onclick="maximizeWin('${id}')" title="Maximise">⬜</div>
        <div class="wc close" onclick="closeWin('${id}')" title="Close">✕</div>
      </div>
    </div>
    <div class="win-body" id="wb-${id}">${getContent(id)}</div>`;

  document.body.appendChild(win);
  bringToFront(win);
  makeDraggable(win, win.querySelector(`#tb-${id}`));
  makeResizable(win);
  win.addEventListener('mousedown', () => bringToFront(win));
  openWins.push(id);
  addTapp(app);
  if (id === 'calc') initCalc();
}

function closeWin(id) {
  document.getElementById('win-' + id)?.remove();
  openWins = openWins.filter(w => w !== id);
  document.getElementById('tapp-' + id)?.remove();
}
function minimizeWin(id) {
  const w = document.getElementById('win-' + id);
  if (w) w.style.display = w.style.display === 'none' ? 'flex' : 'none';
}
function maximizeWin(id) {
  const w = document.getElementById('win-' + id);
  if (!w) return;
  if (w.dataset.max === '1') {
    const p = JSON.parse(w.dataset.prev);
    Object.assign(w.style, p);
    w.style.borderRadius = '10px';
    w.dataset.max = '';
  } else {
    w.dataset.prev = JSON.stringify({ left: w.style.left, top: w.style.top, width: w.style.width, height: w.style.height });
    w.style.left = '0'; w.style.top = '0';
    w.style.width = '100vw'; w.style.height = 'calc(100vh - 48px)';
    w.style.borderRadius = '0';
    w.dataset.max = '1';
  }
}

function addTapp(app) {
  if (document.getElementById('tapp-' + app.id)) return;
  const btn = document.createElement('div');
  btn.className = 'tapp active'; btn.id = 'tapp-' + app.id;
  btn.textContent = app.emoji; btn.title = app.name;
  btn.onclick = () => {
    const w = document.getElementById('win-' + app.id);
    if (!w) return;
    if (w.style.display === 'none') { w.style.display = 'flex'; bringToFront(w); }
    else bringToFront(w);
  };
  document.getElementById('taskbar-apps').appendChild(btn);
}

/* ── App Content ── */
function getContent(id) {
  switch(id) {
    case 'explorer': return explorerHTML();
    case 'notepad':  return notepadHTML();
    case 'browser':  return browserHTML();
    case 'settings': return settingsHTML();
    case 'terminal': return terminalHTML();
    case 'calc':     return calcHTML();
    case 'store':    return storeHTML();
    case 'teams':    return teamsHTML();
    case 'copilot':  return copilotHTML();
    case 'snip':     return snipHTML();
    case 'photos':   return photosHTML();
    case 'about':    return aboutHTML();
    default: return `<div class="win-pad" style="color:#aaa">App "${id}" coming soon.</div>`;
  }
}

function explorerHTML() { return `
  <div style="display:flex;height:100%">
    <div style="width:180px;background:rgba(0,0,0,0.2);border-right:1px solid rgba(255,255,255,0.06);padding:8px;overflow-y:auto;font-size:12px;">
      ${[['🏠','Home'],['⭐','Quick access'],['💻','This PC'],['☁️','OneDrive'],['🌐','Network']].map(([e,n])=>`
        <div style="padding:7px 10px;border-radius:6px;cursor:pointer;display:flex;align-items:center;gap:8px;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background=''">${e} ${n}</div>`).join('')}
      <div style="height:1px;background:rgba(255,255,255,0.07);margin:6px 4px"></div>
      ${['Desktop','Documents','Downloads','Pictures','Music','Videos'].map(n=>`
        <div style="padding:5px 10px 5px 22px;border-radius:6px;cursor:pointer;font-size:11px;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background=''">${n}</div>`).join('')}
    </div>
    <div style="flex:1;display:flex;flex-direction:column;">
      <div style="height:40px;background:rgba(0,0,0,0.15);border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;padding:0 12px;gap:6px;font-size:12px">
        ${['←','→','↑'].map(s=>`<button style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:#ccc;width:28px;height:26px;border-radius:4px;cursor:pointer;font-size:13px">${s}</button>`).join('')}
        <div style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:4px;padding:4px 10px;font-size:11px;color:#aaa;display:flex;align-items:center;gap:6px">📁 <span>This PC › Documents</span></div>
        <input style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:4px;padding:4px 10px;color:#fff;font-size:11px;outline:none;width:140px" placeholder="🔍 Search"/>
      </div>
      <div style="flex:1;padding:16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:8px;align-content:start;overflow-y:auto">
        ${['Documents','Downloads','Desktop','Pictures','Music','Videos','WinLectron','Projects'].map(n=>`
          <div style="display:flex;flex-direction:column;align-items:center;gap:5px;padding:10px 4px;border-radius:8px;cursor:pointer;border:1px solid transparent;" onmouseover="this.style.background='rgba(0,103,192,0.15)';this.style.borderColor='rgba(0,103,192,0.3)'" onmouseout="this.style.background='';this.style.borderColor='transparent'">
            <span style="font-size:32px">📁</span><span style="font-size:11px;text-align:center">${n}</span>
          </div>`).join('')}
      </div>
      <div style="height:24px;background:rgba(0,0,0,0.2);border-top:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;padding:0 12px;font-size:11px;color:#666">8 items</div>
    </div>
  </div>`; }

function notepadHTML() { return `
  <div style="display:flex;flex-direction:column;height:100%">
    <div class="win-menubar">
      ${['File','Edit','View'].map(m=>`<div class="menu-item">${m}</div>`).join('')}
    </div>
    <textarea style="flex:1;background:rgba(255,255,255,0.97);color:#1a1a1a;border:none;outline:none;padding:12px;font-family:'Cascadia Code','Consolas',monospace;font-size:14px;resize:none;" placeholder="Start typing..."></textarea>
    <div style="height:24px;background:rgba(0,0,0,0.3);border-top:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;padding:0 12px;font-size:11px;color:#666;gap:16px">
      <span>Ln 1, Col 1</span><span>UTF-8</span><span>Windows (CRLF)</span>
    </div>
  </div>`; }

function browserHTML() { return `
  <div style="display:flex;flex-direction:column;height:100%">
    <div style="height:40px;background:rgba(0,0,0,0.3);border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;padding:0 8px;gap:4px">
      ${['←','→','↺'].map(s=>`<button style="background:rgba(255,255,255,0.05);border:none;color:#ccc;width:30px;height:28px;cursor:pointer;font-size:13px;border-radius:6px;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">${s}</button>`).join('')}
      <div style="flex:1;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:20px;height:28px;display:flex;align-items:center;padding:0 12px;font-size:12px;color:#aaa">🔒 &nbsp;winlectron://newtab</div>
      <button style="background:rgba(255,255,255,0.05);border:none;color:#ccc;width:30px;height:28px;cursor:pointer;font-size:16px;border-radius:6px;">⋯</button>
    </div>
    <div style="flex:1;background:rgba(15,20,40,0.8);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px">
      <div style="font-size:18px;font-weight:300;color:#ccc">🌐 &nbsp;Winlectron Edge</div>
      <div style="display:grid;grid-template-columns:repeat(4,90px);gap:10px">
        ${[['🔍','Google'],['📺','YouTube'],['🐙','GitHub'],['📰','Bing News']].map(([e,n])=>`
          <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:14px 8px;text-align:center;cursor:pointer;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
            <div style="font-size:26px;margin-bottom:6px">${e}</div><div style="font-size:11px;color:#aaa">${n}</div>
          </div>`).join('')}
      </div>
    </div>
  </div>`; }

function settingsHTML() { return `
  <div style="display:flex;height:100%">
    <div style="width:200px;background:rgba(0,0,0,0.2);border-right:1px solid rgba(255,255,255,0.06);padding:8px;font-size:12px;overflow-y:auto">
      <div style="padding:8px 12px;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px">Settings</div>
      ${[['👤','Account'],['🖥','System'],['📱','Bluetooth & devices'],['🌐','Network & internet'],['🎨','Personalisation'],['📦','Apps'],['🕐','Time & language'],['🎮','Gaming'],['♿','Accessibility'],['🔒','Privacy & security'],['🔄','Windows Update']].map(([e,n])=>`
        <div style="padding:8px 10px;border-radius:6px;cursor:pointer;display:flex;align-items:center;gap:8px;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background=''">${e} ${n}</div>`).join('')}
    </div>
    <div style="flex:1;padding:24px;overflow-y:auto">
      <h2 style="font-size:22px;font-weight:300;margin-bottom:6px">System</h2>
      <p style="font-size:12px;color:#888;margin-bottom:20px">Display, sound, notifications, power</p>
      ${[['🖥','Display','Screen resolution, brightness, night light'],['🔊','Sound','Volume, output, input devices'],['🔔','Notifications','App alerts and banners'],['⚡','Power','Sleep, battery saver'],['💾','Storage','Disk space, saving locations'],['📋','Clipboard','Clipboard history and sync']].map(([e,n,d])=>`
        <div style="display:flex;align-items:center;gap:14px;padding:14px 16px;border:1px solid rgba(255,255,255,0.07);border-radius:8px;margin-bottom:6px;cursor:pointer;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background=''">
          <span style="font-size:22px;background:rgba(0,103,192,0.2);padding:8px;border-radius:8px">${e}</span>
          <div><div style="font-size:13px">${n}</div><div style="font-size:11px;color:#777;margin-top:2px">${d}</div></div>
          <span style="margin-left:auto;color:#555">›</span>
        </div>`).join('')}
    </div>
  </div>`; }

function terminalHTML() { return `
  <div style="background:#0c0c0c;height:100%;display:flex;flex-direction:column;border-radius:0 0 10px 10px;">
    <div style="display:flex;align-items:center;gap:1px;background:#1a1a1a;padding:6px 8px;border-bottom:1px solid #222;">
      <div style="background:#2d2d2d;border-radius:5px 5px 0 0;padding:4px 14px;font-size:12px;color:#ccc;display:flex;align-items:center;gap:6px;cursor:pointer;">
        <span>⌨️</span> PowerShell <span style="color:#555;margin-left:4px">✕</span>
      </div>
      <div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;color:#666;cursor:pointer;font-size:18px;margin-left:4px">+</div>
    </div>
    <div id="term-out" style="flex:1;overflow-y:auto;padding:12px;font-family:'Cascadia Code','Consolas',monospace;font-size:13px;color:#cccccc;white-space:pre-wrap;line-height:1.7">
<span style="color:#4ec9b0">Windows PowerShell 7.4</span>
<span style="color:#888">Copyright (C) Microsoft Corporation. All rights reserved.</span>

<span style="color:#4ec9b0">PS</span> <span style="color:#ce9178">C:\Users\User</span><span style="color:#fff">&gt;</span> </div>
    <div style="display:flex;align-items:center;gap:6px;padding:8px 12px;border-top:1px solid #1a1a1a;font-family:'Cascadia Code','Consolas',monospace;font-size:13px;">
      <span style="color:#4ec9b0">PS</span>&nbsp;<span style="color:#ce9178">C:\Users\User</span><span style="color:#fff">&gt;</span>&nbsp;
      <input id="term-in" style="flex:1;background:transparent;border:none;color:#cccccc;font-family:'Cascadia Code','Consolas',monospace;font-size:13px;outline:none;"/>
    </div>
  </div>`; }

function calcHTML() { return `
  <div style="background:#202020;height:100%;display:flex;flex-direction:column;max-width:320px;margin:auto;border-radius:0 0 10px 10px;">
    <div style="padding:12px 16px;font-size:13px;color:#888;border-bottom:1px solid rgba(255,255,255,0.06);">Standard</div>
    <div id="calc-hist" style="text-align:right;padding:4px 16px;font-size:12px;color:#555;min-height:22px;"></div>
    <div id="calc-disp" style="text-align:right;padding:4px 20px 16px;font-size:44px;font-weight:200;">0</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(255,255,255,0.05);flex:1" id="calc-grid"></div>
  </div>`; }

function storeHTML() { const apps=[['🎮','Xbox Game Bar'],['📸','Camera'],['🎵','Groove Music'],['🗺️','Maps'],['📰','News'],['🌤️','Weather'],['✂️','Snipping Tool'],['🖩','Calculator']]; return `
  <div style="height:100%;display:flex;flex-direction:column;background:rgba(0,0,0,0.1)">
    <div style="height:44px;background:rgba(0,0,0,0.2);border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;padding:0 16px;gap:16px;font-size:12px">
      ${['Home','Apps','Games','Films'].map(t=>`<div style="padding:0 4px;height:44px;display:flex;align-items:center;cursor:pointer;border-bottom:2px solid transparent;" onmouseover="this.style.borderBottomColor='#0067C0'" onmouseout="this.style.borderBottomColor='transparent'">${t}</div>`).join('')}
      <div style="margin-left:auto;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:5px 14px;font-size:12px;color:#888">🔍 Search Store</div>
    </div>
    <div style="flex:1;overflow-y:auto;padding:16px">
      <div style="background:linear-gradient(135deg,#003a82,#0067C0);border-radius:10px;padding:24px;margin-bottom:20px">
        <div style="font-size:18px;font-weight:300;margin-bottom:4px">Microsoft Store</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.7)">Apps, games and more for Windows 11</div>
      </div>
      <div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">Featured</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
        ${apps.map(([e,n])=>`
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:16px;text-align:center;cursor:pointer;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='rgba(255,255,255,0.04)'">
            <div style="font-size:34px;margin-bottom:8px">${e}</div>
            <div style="font-size:11px;margin-bottom:10px">${n}</div>
            <button style="background:rgba(0,103,192,0.7);border:none;color:#fff;padding:4px 14px;border-radius:4px;cursor:pointer;font-size:11px">Get</button>
          </div>`).join('')}
      </div>
    </div>
  </div>`; }

function teamsHTML() { return `
  <div style="display:flex;height:100%">
    <div style="width:56px;background:rgba(0,0,0,0.4);display:flex;flex-direction:column;align-items:center;padding:12px 0;gap:8px;border-right:1px solid rgba(255,255,255,0.06)">
      ${[['💬','Chat'],['👥','Teams'],['📅','Calendar'],['📁','Files'],['📞','Calls']].map(([e,t])=>`<div title="${t}" style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:8px;cursor:pointer;font-size:20px;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background=''">${e}</div>`).join('')}
    </div>
    <div style="width:220px;border-right:1px solid rgba(255,255,255,0.06);padding:12px;overflow-y:auto;background:rgba(0,0,0,0.15)">
      <div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Recent</div>
      ${[['🟢','General','Hey everyone!'],['🟡','Dev Team','Build passing ✅'],['🔵','Design','New mockups!'],['⚪','WinLectron','Latest commit']].map(([d,n,m])=>`
        <div style="padding:8px;border-radius:8px;cursor:pointer;margin-bottom:4px;" onmouseover="this.style.background='rgba(255,255,255,0.07)'" onmouseout="this.style.background=''">
          <div style="font-size:12px;margin-bottom:2px">${d} <b>${n}</b></div>
          <div style="font-size:11px;color:#777;padding-left:16px">${m}</div>
        </div>`).join('')}
    </div>
    <div style="flex:1;display:flex;flex-direction:column;padding:16px">
      <div style="border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:10px;margin-bottom:12px;font-size:14px">💬 General</div>
      <div style="flex:1;display:flex;flex-direction:column;gap:10px;overflow-y:auto;font-size:12px">
        ${[['A','Alice','Hey team, WinLectron looks amazing!'],['B','Bob','The Win11 UI is 🔥'],['Y','You','Thanks! Working on Teams now 😄']].map(([l,n,m])=>`
          <div style="display:flex;gap:8px">
            <div style="width:28px;height:28px;border-radius:50%;background:rgba(0,103,192,0.6);display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0">${l}</div>
            <div><div style="font-size:10px;color:#777;margin-bottom:3px">${n}</div>
            <div style="background:rgba(255,255,255,0.05);padding:7px 10px;border-radius:0 8px 8px 8px;line-height:1.4">${m}</div></div>
          </div>`).join('')}
      </div>
      <div style="display:flex;gap:8px;margin-top:12px">
        <input placeholder="Type a message..." style="flex:1;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:9px 12px;color:#fff;font-size:12px;outline:none;font-family:inherit"/>
        <button style="background:#0067C0;border:none;color:#fff;padding:9px 14px;border-radius:8px;cursor:pointer">➤</button>
      </div>
    </div>
  </div>`; }

function copilotHTML() { return `
  <div style="display:flex;flex-direction:column;height:100%;background:linear-gradient(160deg,rgba(0,40,80,0.4),transparent)">
    <div style="text-align:center;padding:28px 0 16px">
      <div style="font-size:40px;margin-bottom:8px">🤖</div>
      <div style="font-size:20px;font-weight:300">Copilot</div>
      <div style="font-size:12px;color:#666;margin-top:4px">Your everyday AI companion</div>
    </div>
    <div style="flex:1;overflow-y:auto;padding:0 20px;display:flex;flex-direction:column;gap:10px" id="copilot-msgs">
      <div style="background:rgba(0,103,192,0.15);border:1px solid rgba(0,103,192,0.25);border-radius:12px;padding:12px 16px;font-size:13px;line-height:1.5">
        👋 Hi! I'm Copilot. Ask me anything — writing, coding, questions, and more.
      </div>
    </div>
    <div style="padding:14px 20px;display:flex;gap:10px;border-top:1px solid rgba(255,255,255,0.06)">
      <input id="copilot-in" placeholder="Ask me anything..." style="flex:1;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:10px 18px;color:#fff;font-size:13px;outline:none;font-family:inherit" onkeydown="if(event.key==='Enter')sendCopilot()"/>
      <button onclick="sendCopilot()" style="background:#0067C0;border:none;color:#fff;width:40px;height:40px;border-radius:50%;cursor:pointer;font-size:16px;flex-shrink:0">➤</button>
    </div>
  </div>`; }

function snipHTML() { return `
  <div style="display:flex;flex-direction:column;height:100%;gap:0">
    <div style="height:44px;background:rgba(0,0,0,0.2);border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;padding:0 12px;gap:8px">
      ${[['⬜','Rectangle'],['⭕','Freeform'],['🪟','Window'],['🖥','Full']].map(([e,n])=>`
        <button style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#fff;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:5px">${e} ${n}</button>`).join('')}
      <button style="background:#0067C0;border:none;color:#fff;padding:6px 16px;border-radius:6px;cursor:pointer;font-size:12px;margin-left:auto">📸 New Snip</button>
    </div>
    <div style="flex:1;background:rgba(255,255,255,0.02);border:2px dashed rgba(255,255,255,0.08);margin:16px;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#555">
      <span style="font-size:44px">✂️</span>
      <span style="font-size:13px">Click "New Snip" to capture a screenshot</span>
    </div>
  </div>`; }

function photosHTML() { const imgs=['🌅','🌄','🏔','🌊','🌸','🌿','🦋','🌻','🎑','🌈']; return `
  <div style="height:100%;display:flex;flex-direction:column;background:rgba(0,0,0,0.1)">
    <div style="height:44px;background:rgba(0,0,0,0.2);border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;padding:0 16px;gap:16px;font-size:12px">
      ${['Collection','Albums','Folders'].map(t=>`<div style="padding:0 4px;height:44px;display:flex;align-items:center;cursor:pointer;border-bottom:2px solid transparent;" onmouseover="this.style.borderBottomColor='#0067C0'" onmouseout="this.style.borderBottomColor='transparent'">${t}</div>`).join('')}
    </div>
    <div style="flex:1;padding:12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:4px;overflow-y:auto">
      ${imgs.map(e=>`<div style="aspect-ratio:1;background:rgba(255,255,255,0.04);border:1px solid transparent;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:48px;cursor:pointer;" onmouseover="this.style.borderColor='#0067C0'" onmouseout="this.style.borderColor='transparent'">${e}</div>`).join('')}
    </div>
  </div>`; }

function aboutHTML() { return `
  <div class="win-pad" style="text-align:center;padding:36px">
    <svg viewBox="0 0 88 88" width="60" style="margin-bottom:14px"><rect x="2" y="2" width="38" height="38" fill="#0067C0" rx="5"/><rect x="48" y="2" width="38" height="38" fill="#0067C0" rx="5"/><rect x="2" y="48" width="38" height="38" fill="#0067C0" rx="5"/><rect x="48" y="48" width="38" height="38" fill="#0067C0" rx="5"/></svg>
    <div style="font-size:22px;font-weight:300;margin-bottom:4px">Windows 11</div>
    <div style="font-size:12px;color:#666;margin-bottom:24px">WinLectron Simulator · Electron Edition</div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:16px;text-align:left;font-size:12px;line-height:2.2;max-width:360px;margin:auto">
      <div>🪟 &nbsp;Edition: Windows 11 Pro (Simulated)</div>
      <div>🔢 &nbsp;Version: 23H2 · Build 22631</div>
      <div>⚡ &nbsp;Engine: Electron v28</div>
      <div>📦 &nbsp;WinLectron: v1.0.0</div>
      <div>📜 &nbsp;License: MIT Open Source</div>
    </div>
  </div>`; }

/* ── Calculator ── */
function initCalc() {
  const grid = document.getElementById('calc-grid');
  const disp = document.getElementById('calc-disp');
  const hist = document.getElementById('calc-hist');
  if (!grid) return;
  let expr = '';
  const layout = [['%','CE','C','⌫'],['1/x','x²','√x','÷'],['7','8','9','×'],['4','5','6','−'],['1','2','3','+'],['+/−','0','.','=']];
  layout.flat().forEach(label => {
    const btn = document.createElement('div');
    const isEq = label==='=', isOp=['÷','×','−','+'].includes(label), isFn=['%','CE','C','⌫','1/x','x²','√x','+/−'].includes(label);
    btn.style.cssText = `background:${isEq?'#0067C0':isFn?'rgba(255,255,255,0.08)':'rgba(255,255,255,0.04)'};display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;min-height:54px;transition:filter 0.1s;color:#fff;`;
    btn.textContent = label;
    btn.onmouseover = () => btn.style.filter = 'brightness(1.3)';
    btn.onmouseout  = () => btn.style.filter = '';
    btn.onclick = () => {
      if (label==='C'||label==='CE') { expr=''; disp.textContent='0'; hist.textContent=''; }
      else if (label==='⌫') { expr=expr.slice(0,-1); disp.textContent=expr||'0'; }
      else if (label==='=') { try { hist.textContent=expr+' ='; const r=eval(expr.replace('×','*').replace('÷','/').replace('−','-')); disp.textContent=r; expr=String(r); } catch { disp.textContent='Error'; expr=''; } }
      else if (label==='+/−') { expr=expr?String(-parseFloat(expr)):'0'; disp.textContent=expr; }
      else if (label==='%') { try { disp.textContent=parseFloat(eval(expr))/100; expr=String(disp.textContent); } catch {} }
      else if (label==='x²') { try { disp.textContent=Math.pow(parseFloat(eval(expr)),2); expr=String(disp.textContent); } catch {} }
      else if (label==='√x') { try { disp.textContent=Math.sqrt(parseFloat(eval(expr))); expr=String(disp.textContent); } catch {} }
      else if (label==='1/x') { try { disp.textContent=1/parseFloat(eval(expr)); expr=String(disp.textContent); } catch {} }
      else { expr+=label; disp.textContent=expr; }
    };
    grid.appendChild(btn);
  });
}

/* ── Copilot ── */
function sendCopilot() {
  const input = document.getElementById('copilot-in');
  const msgs  = document.getElementById('copilot-msgs');
  if (!input || !msgs || !input.value.trim()) return;
  const q = input.value.trim(); input.value = '';
  msgs.innerHTML += `<div style="text-align:right"><span style="background:rgba(0,103,192,0.5);border-radius:14px 14px 0 14px;padding:9px 14px;font-size:13px;display:inline-block;max-width:80%">${q}</span></div>`;
  msgs.scrollTop = msgs.scrollHeight;
  setTimeout(() => {
    const r = ['Great question! Let me think...','Happy to help with that!','In WinLectron, anything is possible 🚀','Here\'s what I know about that...'];
    msgs.innerHTML += `<div style="background:rgba(0,103,192,0.15);border:1px solid rgba(0,103,192,0.25);border-radius:12px;padding:10px 14px;font-size:13px;line-height:1.5">${r[Math.floor(Math.random()*r.length)]}</div>`;
    msgs.scrollTop = msgs.scrollHeight;
  }, 700);
}

/* ── Terminal ── */
document.addEventListener('keydown', e => {
  const input = document.getElementById('term-in');
  if (!input || document.activeElement !== input || e.key !== 'Enter') return;
  const cmd = input.value.trim(); input.value = '';
  const out = document.getElementById('term-out');
  if (!out) return;
  const cmds = {
    help: 'Available: help, ver, whoami, date, clear, winver, ls, exit',
    ver: 'PowerShell 7.4.0 (WinLectron)',
    whoami: 'WINLECTRON\\User',
    winver: 'Windows 11 Version 23H2 (Build 22631)',
    date: new Date().toString(),
    ls: '    Directory: C:\\Users\\User\n\nMode    Name\n----    ----\nd-r--   Desktop\nd-r--   Documents\nd-r--   Downloads\nd-r--   Pictures',
    clear: '__clear__', exit: '__exit__'
  };
  if (cmd === 'clear') {
    out.innerHTML = '<span style="color:#4ec9b0">PS</span> <span style="color:#ce9178">C:\\Users\\User</span><span style="color:#fff">&gt;</span> ';
  } else if (cmd === 'exit') {
    closeWin('terminal');
  } else {
    const res = cmds[cmd] || (cmd.startsWith('echo ') ? cmd.slice(5) : `'${cmd}' is not recognized as a cmdlet.`);
    out.innerHTML += `\n<span style="color:#4ec9b0">PS</span> <span style="color:#ce9178">C:\\Users\\User</span><span style="color:#fff">&gt;</span> ${cmd}\n${res}`;
    out.scrollTop = out.scrollHeight;
  }
});

/* ── Desktop Icons ── */
function initDesktop() {
  const desk = document.getElementById('desktop');
  DESKTOP_ICONS.forEach(ic => {
    const el = document.createElement('div');
    el.className = 'icon';
    el.style.left = ic.x + 'px'; el.style.top = ic.y + 'px';
    el.innerHTML = `<div class="icon-img">${ic.emoji}</div><div class="icon-label">${ic.name}</div>`;
    el.addEventListener('dblclick', () => openWindow(ic.id));
    el.addEventListener('click', e => {
      document.querySelectorAll('.icon').forEach(i => i.classList.remove('selected'));
      el.classList.add('selected'); e.stopPropagation();
    });
    desk.appendChild(el);
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.icon')) document.querySelectorAll('.icon').forEach(i => i.classList.remove('selected'));
  });
}

/* ── Start Menu ── */
function toggleStart() {
  const sm  = document.getElementById('start-menu');
  const btn = document.getElementById('start-btn');
  const opening = !sm.classList.contains('open');
  sm.classList.toggle('open', opening);
  btn.classList.toggle('active', opening);
  closeNotif();
  if (opening) populateStart();
}
function closeStart() {
  document.getElementById('start-menu')?.classList.remove('open');
  document.getElementById('start-btn')?.classList.remove('active');
}
function populateStart() {
  const pinned = document.getElementById('sm-pinned');
  const rec    = document.getElementById('sm-recommended');
  if (pinned.innerHTML) return;
  APPS.forEach(app => {
    const el = document.createElement('div'); el.className = 'sm-app';
    el.innerHTML = `<div class="sm-app-icon">${app.emoji}</div><span>${app.name}</span>`;
    el.onclick = () => { openWindow(app.id); closeStart(); };
    (app.pinned ? pinned : rec).appendChild(el);
  });
}

/* ── Notifications ── */
function toggleNotif() {
  const p = document.getElementById('notif-panel');
  p.classList.toggle('open');
  closeStart();
}
function closeNotif() { document.getElementById('notif-panel')?.classList.remove('open'); }
function clearNotifs() { document.getElementById('notif-list').innerHTML = '<div style="color:#555;font-size:12px;text-align:center;padding:20px">No new notifications</div>'; }

/* ── Context Menu ── */
document.addEventListener('contextmenu', e => {
  e.preventDefault(); closeStart(); closeNotif();
  const cm = document.getElementById('ctx-menu');
  cm.style.left = Math.min(e.clientX, window.innerWidth - 210) + 'px';
  cm.style.top  = Math.min(e.clientY, window.innerHeight - 230) + 'px';
  cm.classList.add('show');
});
document.addEventListener('click', e => {
  if (!e.target.closest('#ctx-menu'))    document.getElementById('ctx-menu')?.classList.remove('show');
  if (!e.target.closest('#start-menu') && !e.target.closest('#start-btn')) closeStart();
  if (!e.target.closest('#notif-panel') && !e.target.closest('.tray-btn')) closeNotif();
});
document.querySelectorAll('.ctx-item').forEach(item => {
  item.addEventListener('click', () => {
    const a = item.dataset.action;
    if (a === 'about') openWindow('about');
    else if (a === 'settings') openWindow('settings');
    else if (a === 'terminal') openWindow('terminal');
  });
});

/* ── Clock ── */
function tickClock() {
  const n = new Date();
  const ct = document.getElementById('clock-time');
  const cd = document.getElementById('clock-date');
  if (ct) ct.textContent = n.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  if (cd) cd.textContent = n.toLocaleDateString([],{day:'numeric',month:'numeric',year:'numeric'});
}

/* ── Init ── */
initDesktop();
tickClock();
setInterval(tickClock, 10000);