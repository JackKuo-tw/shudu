detectBrowser();

function detectBrowser() {
    var userAgent = navigator.userAgent || '';

    // Firefox detection (desktop & mobile)
    var isFirefox = /Firefox|FxiOS/i.test(userAgent);

    // Edge (Chromium based or Legacy)
    var isEdge = /Edg\//i.test(userAgent) || /Edge\//i.test(userAgent);

    // Opera
    var isOpera = /OPR\//i.test(userAgent) || /Opera/i.test(userAgent) || (!!window.opr && !!opr.addons);

    // Chromium / Chrome (Google Chrome, Chromium, Brave, Vivaldi, Arc, etc.)
    var isChromium = /Chrome|CriOS/i.test(userAgent);

    var CHROME_STORE_URL = 'https://chromewebstore.google.com/detail/shudu-%E8%88%92%E8%AE%80/onbppgmmagapemlkoepbkcemidmgacpc';
    var FIREFOX_AMO_URL = 'https://addons.mozilla.org/zh-TW/firefox/addon/shudu/';

    if (isFirefox) {
        loading(FIREFOX_AMO_URL);
    } else if (isChromium || isEdge || isOpera) {
        loading(CHROME_STORE_URL);
    } else {
        var detectEl = document.getElementById('detect');
        var notSupportEl = document.getElementById('not-support');
        if (detectEl) detectEl.style.display = 'none';
        if (notSupportEl) notSupportEl.style.display = '';
    }
}

function loading(url) {
    document.body.innerHTML = "頁面轉址中，請稍候...";
    window.location.href = url;
}
