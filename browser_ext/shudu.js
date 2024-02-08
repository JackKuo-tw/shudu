var unconverted = [];
var conv_dict = new Map();
var browser = chrome
var isProcessing = false;

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
        // 避免上一次請求尚未完成仍發送請求
        if (isProcessing == true) return;
        isProcessing = true;
        console.log("receive 'shudu it'...");
        sendWebSource();
    } else {
        isProcessing = false;
        if (msg.status == 'success') {
            setContent(msg.resp);
            console.log("shudu done!");
        } else if (msg.status == 'failure') {
            alert('舒讀: 轉換失敗\n\n' + msg.resp);
        }
    }
}

function sendWebSource() {
    if (getUnconvertedTextArray().length === 0) {
        console.log("nothing to shudu");
        return;
    }

    // 取得設定檔
    chrome.storage.sync.get({
        lang: 'zh-TW',
        punctuation: 'fullWidth',
        // customTranslationServer: false,
        // customTranslationServerURL: '',
        autoTranslationURL: [],
    }, function(options) {
        if (options.lang == 'zh') { options.lang = 'tw2sp'; } else { options.lang = 's2twp' }
        // 交由 background 處理
        browser.runtime.sendMessage({
            // server: (options.customTranslationServer && options.customTranslationServerURL) || null,
            payload: {
                origin: unconverted,
                punctuation: options.punctuation,
                translation: options.lang,
            }
        });
    })
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
        conv_dict.set(v, msg[k]);
        conv_dict.set(msg[k], msg[k]);
    });
    replaceText();
    unconverted = [];
};

function traverse(parentNode, handler) {
    for (let i in Object.keys(parentNode)) {
        let curNode = parentNode[i];
        let curNodeName = curNode.nodeName;
        // exclude "style, script"
        if (curNodeName == 'STYLE' || curNodeName == 'SCRIPT') {
            continue;
        }
        // if it's #text node, parse it
        if (curNodeName == "#text") {
            curNodeText = curNode.textContent;
            handler(curNode, curNodeText);
        }
        // else if it has childNode, call traverse() recursively
        else if (curNode.hasChildNodes()) {
            traverse(curNode.childNodes, handler);
        }
    }
}

function parsePage() {
    traverse(document.body.childNodes, (curNode, curNodeText) => {
        if (curNodeText.trim().length > 0 && isCJK(curNodeText)) {
            if (!conv_dict.has(curNodeText)) {
                conv_dict.set(curNodeText, undefined);
            }
        }
    });
}

function replaceText() {
    traverse(document.body.childNodes, (curNode, curNodeText) => {
        if (curNodeText.trim().length > 0 && isCJK(curNodeText)) {
            if (!conv_dict.has(curNodeText)) {
                conv_dict.set(curNodeText, undefined);
            } else {
                curNode.textContent = conv_dict.get(curNodeText);
            }
        }
    });
}

// 判斷前後是否加空格
// function spaceSurround(currentNode, converted, index) {
//     if (currentNode.parentNode.nodeName == 'A') {
//         if (converted[index].match(/[a-zA-Z]/) && ifCJK(converted[index - 1] || '')) {
//             converted[index] = ' ' + converted[index];
//         }
//         if (converted[index].slice(-1).match(/[a-zA-Z]/) && ifCJK(converted[index + 1] || '')) {
//             converted[index] = converted[index] + ' ';
//         }
//     }
//     return converted[index];
// }

function isCJK(text) {
    REGEX_CHINESE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;
    hasChinese = text.match(REGEX_CHINESE);
    if (hasChinese == null) return false;
    return true;
}

// usage: if (isInsideTag(node, 'TEXTAREA', 'mce-container')) continue;
// function isInsideTag(node, tagName, className = null) {
//     if (node.tagName == tagName || node.parentElement.tagName == tagName || node.parentElement.classList.contains(className)) return true;
//     if (node.parentElement.parentElement) {
//         return isInsideTag(node.parentElement, tagName, className)
//     }
//     return false;
// }