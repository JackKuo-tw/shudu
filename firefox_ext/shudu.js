var virtualBody, mappingElement;
var browser = browser || chrome

browser.runtime.onMessage.addListener(handler);

function handler(msg) {
    if (msg == 'shudu it') {
        console.log("receive 'shudu it'...");
        browser.runtime.sendMessage({
            'origin': getContent(),
            'punctuation': 'fullWidth',
            'format': 'html',
        });
    } else {
        setContent(msg);
    }
}

function getContent() {
    const parsed = parseHTML(document.body.innerHTML);
    console.log(parsed);
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