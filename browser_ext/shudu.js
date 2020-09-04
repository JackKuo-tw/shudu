var virtualBody, mappingElement;
var browser = chrome

browser.runtime.onMessage.addListener(handler);

// 自動執行 shudu 判斷
chrome.storage.sync.get({
    autoTranslationURL: [],
}, function(urls) {
    const href = window.location.href;
    if (urls.autoTranslationURL.some(item => href.includes(item))) {
        handler('shudu it');
    }
})

function handler(msg) {
    if (msg == 'shudu it') {
        console.log("receive 'shudu it'...");
        sendWebSource();
    } else {
        if (msg.status == 'success') {
            setContent(msg.resp);
        } else if (msg.status == 'failure') {
            alert('舒讀: 轉換失敗\n\n' + msg.resp);
        }
    }
}

function sendWebSource() {
    // 取得設定檔
    chrome.storage.sync.get({
        lang: 'zh-TW',
        punctuation: 'fullWidth',
        customTranslationServer: false,
        customTranslationServerURL: '',
        autoTranslationURL: [],
    }, function(options) {
        if (options.lang == 'zh') { options.lang = 'tw2sp'; } else { options.lang = 's2twp' }
        // 交由 background 處理
        browser.runtime.sendMessage({
            server: (options.customTranslationServer && options.customTranslationServerURL) || null,
            payload: {
                origin: getContent(),
                punctuation: options.punctuation,
                translation: options.lang,
            }
        });
    })
}

function getContent() {
    const parsed = parseHTML(document.body.innerHTML);
    console.log('parsed', parsed);
    return parsed;
}

function setContent(msg) {
    replaceText(msg.converted);
    document.body.innerHTML = virtualBody.innerHTML;
};

function parseHTML(htmlContent) {
    virtualBody = document.createElement('body');
    mappingElement = [];
    virtualBody.innerHTML = htmlContent;
    const treeWalker = document.createTreeWalker(virtualBody, 1 | 4, null, false);
    const stringArr = [];
    while (treeWalker.nextNode()) {
        const node = treeWalker.currentNode;
        switch (node.nodeName.toLowerCase()) {
            case '#text':
                const nodeText = node.textContent;
                if (nodeText.trim().length == 0 || !ifCJK(nodeText)) break;
                stringArr.push(nodeText);
                mappingElement.push(node);
                break;
            case 'option':
                stringArr.push(node.text);
                mappingElement.push(node);
                break;
        }
    }
    return stringArr;
}

function replaceText(converted) {
    const treeWalker = document.createTreeWalker(virtualBody, 1 | 4, null, false);
    while (treeWalker.nextNode()) {
        const node = treeWalker.currentNode;
        switch (node.nodeName.toLowerCase()) {
            case '#text':
                const nodeText = node.textContent;
                if (nodeText.trim().length == 0 || !ifCJK(nodeText)) break;
                node.textContent = converted[0];
                converted.shift();
                break;
            case 'option':
                node.text = converted[0];
                converted.shift();
                break;
        }
    }
}

function ifCJK(text) {
    REGEX_CHINESE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;
    hasChinese = text.match(REGEX_CHINESE);
    if (hasChinese == null) return false;
    return true;
}