// Win11 Setup Script
// Handles initial OOBE (Out-of-Box Experience) configuration

const setupConfig = {
  version: '11',
  build: '22631',
  language: 'united states -- english',
  region: 'unknown',
  username: 'preconfigured',
};

function completeSetup() {
  localStorage.setItem('winlectron_setup_done', '1');
  localStorage.setItem('winlectron_config', JSON.stringify(setupConfig));
  window.location.href = '../src/desktop/desktop.html';
}

console.log('[WinLectron Setup] Win11 OOBE initialized');