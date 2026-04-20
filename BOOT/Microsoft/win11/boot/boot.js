window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (window.electronAPI) {
      window.electronAPI.bootComplete('win11');
    } else {
      window.location.href = '../src/desktop/desktop.html';
    }
  }, 3500);
});