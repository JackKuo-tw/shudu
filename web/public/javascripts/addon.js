detectBrowser()

function detectBrowser() {
    // Opera 8.0+
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';

    // Safari 3.0+ "[object HTMLElementConstructor]" 
    var isSafari = /constructor/i.test(window.HTMLElement) || (function(p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/ false || !!document.documentMode;

    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;

    // Chrome 1 - 79
    var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

    // Edge (based on chromium) detection
    var isEdgeChromium = !!window.chrome && (navigator.userAgent.indexOf("Edg") != -1);

    // Blink engine detection
    var isBlink = (isChrome || isOpera) && !!window.CSS;

    if (isFirefox) {
        loading('https://addons.mozilla.org/zh-TW/firefox/addon/shudu/');
    } else if (isChrome || isEdgeChromium) {
        loading('https://chrome.google.com/webstore/detail/shudu-%E8%88%92%E8%AE%80/onbppgmmagapemlkoepbkcemidmgacpc');
    } else {
        document.getElementById('detect').style.display = 'none';
        document.getElementById('not-support').style.display = '';
    }
}

function loading(url) {
    document.body.innerHTML = "頁面轉址中，請稍候...";
    window.location.href = url;
}
