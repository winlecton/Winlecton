// Win11 App Registry — extends desktop.js APPS list
// Additional apps specific to Windows 11 experience
 
const WIN11_EXTRA_APPS = [
  { id: 'teams',   name: 'Microsoft Teams', emoji: '💬' },
  { id: 'copilot', name: 'Copilot',         emoji: '🤖' },
  { id: 'snip',    name: 'Snipping Tool',   emoji: '✂️' },
  { id: 'store',   name: 'Microsoft Store', emoji: '🛒' },
  { id: 'edge',    name: 'Winlectron Edge', emoji: '🌐' }
];
 
// Auto-register when desktop.js is loaded
if (typeof APPS !== 'undefined') {
  WIN11_EXTRA_APPS.forEach(app => {
    if (!APPS.find(a => a.id === app.id)) APPS.push(app);
  });
}
 