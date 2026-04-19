var unconverted = [];
var conv_dict = new Map();
var browser = chrome;
var isProcessing = false;

browser.runtime.onMessage.addListener(handler);

// Defer auto-translation check to ensure pangu.js is loaded
setTimeout(checkAutoTranslation, 0);

function checkAutoTranslation() {
    chrome.storage.sync.get({
        autoTranslationURL: [],
    }, function (urls) {
        const href = window.location.href;
        if (urls.autoTranslationURL.some(item => href.includes(item))) {
            handler('shudu it');
        }
    });
}

async function handler(msg) {
    if (msg == 'shudu it') {
        if (isProcessing) return;
        isProcessing = true;

        try {
            await runLocalConversion();
            console.log("[Shudu] shudu done!");
        } catch (e) {
            console.error(e);
            alert('舒讀: 轉換失敗\n\n' + e.toString());
        } finally {
            isProcessing = false;
        }
    }
}

async function runLocalConversion() {
    if (getUnconvertedTextArray().length === 0) {
        console.log("nothing to shudu");
        return;
    }

    const options = await new Promise(resolve => {
        chrome.storage.sync.get({
            lang: 'zh-TW',
            punctuation: 'fullWidth',
        }, resolve);
    });

    const configName = options.lang == 'zh' ? 'tw2sp.json' : 's2twp.json';

    // Send text to background worker for conversion (bypasses page CSP)
    const result = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            { action: 'convert', texts: unconverted, configName },
            (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else if (response && response.error) {
                    reject(new Error(response.error));
                } else {
                    resolve(response);
                }
            }
        );
    });

    let convertedArray = result.converted;

    if (options.punctuation === 'fullWidth' && typeof pangu !== 'undefined') {
        convertedArray = convertedArray.map(text => pangu.spacing(text));
    }

    setContent({ converted: convertedArray });
}

function getUnconvertedTextArray() {
    parsePage();
    for (let [key, value] of conv_dict) {
        if (value == undefined) {
            unconverted.push(key);
        }
    }
    return unconverted;
}

function setContent(msg) {
    unconverted.forEach((v, k) => {
        if (msg.converted && msg.converted[k]) {
            conv_dict.set(v, msg.converted[k]);
            conv_dict.set(msg.converted[k], msg.converted[k]);
        }
    });
    replaceText();
    unconverted = [];
}

function traverse(nodes, handler) {
    if (!nodes) return;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (!node) continue;

        if (node.nodeType === 3) {
            handler(node, node.textContent);
        } else if (node.nodeType === 1) {
            const tagName = node.tagName.toUpperCase();
            if (['STYLE', 'SCRIPT', 'NOSCRIPT', 'TEMPLATE', 'SVG', 'CANVAS', 'VIDEO', 'AUDIO', 'IFRAME', 'EMBED', 'OBJECT', 'MATH', 'HEAD'].includes(tagName)) {
                continue;
            }
            if (node.childNodes && node.childNodes.length > 0) {
                traverse(node.childNodes, handler);
            }
            if (node.shadowRoot && node.shadowRoot.childNodes) {
                traverse(node.shadowRoot.childNodes, handler);
            }
        }
    }
}

function parsePage() {
    if (document.title && isCJK(document.title)) {
        if (!conv_dict.has(document.title)) {
            conv_dict.set(document.title, undefined);
        }
    }

    if (!document.body) return;
    traverse(document.body.childNodes, (curNode, curNodeText) => {
        if (curNodeText && curNodeText.trim().length > 0 && isCJK(curNodeText)) {
            if (!conv_dict.has(curNodeText)) {
                conv_dict.set(curNodeText, undefined);
            }
        }
    });
}

function replaceText() {
    if (document.title && isCJK(document.title)) {
        const converted = conv_dict.get(document.title);
        if (converted !== undefined && converted !== document.title) {
            document.title = converted;
        }
    }

    if (!document.body) return;
    traverse(document.body.childNodes, (curNode, curNodeText) => {
        if (curNodeText && curNodeText.trim().length > 0 && isCJK(curNodeText)) {
            if (conv_dict.has(curNodeText)) {
                const converted = conv_dict.get(curNodeText);
                if (converted !== undefined && converted !== curNodeText) {
                    curNode.textContent = converted;
                }
            }
        }
    });
}

function isCJK(text) {
    const REGEX_CHINESE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;
    return REGEX_CHINESE.test(text);
}
