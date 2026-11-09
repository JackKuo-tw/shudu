// Shudu PWA Handler
(function () {
  'use strict';

  // 1. Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js')
        .then(function (registration) {
          console.log('[PWA] Service Worker registered:', registration.scope);
        })
        .catch(function (error) {
          console.warn('[PWA] Service Worker registration failed:', error);
        });
    });
  }

  // 2. Install Button & Prompt Management
  var deferredPrompt = null;
  var installBtn = document.getElementById('install-btn');

  // Check if running in standalone mode (already installed)
  var isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                     window.navigator.standalone === true;

  if (isStandalone && installBtn) {
    installBtn.style.display = 'none';
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    // Prevent the default mini-infobar from appearing on mobile
    e.preventDefault();
    deferredPrompt = e;

    // Show custom install button if not already standalone
    if (installBtn && !isStandalone) {
      installBtn.style.display = 'inline-flex';
    }
  });

  if (installBtn) {
    installBtn.addEventListener('click', async function () {
      if (!deferredPrompt) {
        return;
      }

      // Show the browser install prompt
      deferredPrompt.prompt();

      // Wait for user choice
      var choiceResult = await deferredPrompt.userChoice;
      console.log('[PWA] User choice:', choiceResult.outcome);

      // Reset deferredPrompt and hide button
      deferredPrompt = null;
      installBtn.style.display = 'none';
    });
  }

  window.addEventListener('appinstalled', function () {
    console.log('[PWA] App installed successfully');
    if (installBtn) {
      installBtn.style.display = 'none';
    }
    deferredPrompt = null;
  });
})();
