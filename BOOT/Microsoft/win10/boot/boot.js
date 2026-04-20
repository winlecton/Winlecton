window.addEventListener('DOMContentLoaded', () => {
  // Simulate boot sequence — navigate to desktop after 3.5s
  setTimeout(() => {
    if (window.electronAPI) {
      window.electronAPI.bootComplete('win10');
    } else {
      // Fallback for browser preview
      window.location.href = '../src/desktop/desktop.html';
    }
  }, 3500);
});