// Module configuration for OpenCC WASM
// This must be defined before opencc.js runs
var wasmReadyResolve;
var wasmReadyReject;
var wasmReadyPromise = new Promise((resolve, reject) => {
    wasmReadyResolve = resolve;
    wasmReadyReject = reject;
});

var Module = {
    locateFile: function (path, prefix) {
        const url = path.endsWith('.wasm')
            ? chrome.runtime.getURL('libs/opencc/' + path)
            : prefix + path;
        return url;
    },
    onRuntimeInitialized: async function () {
        try {
            await loadDependencies();
            isWasmReady = true;
            wasmReadyResolve();
        } catch (e) {
            console.error("[Shudu] Failed to load dependencies:", e);
            wasmReadyReject(e);
        }
    },
    onAbort: function (what) {
        console.error("[Shudu] WASM aborted:", what);
        wasmReadyReject(new Error("WASM aborted: " + what));
    },
    print: function (text) { console.log('[Shudu]', text); },
    printErr: function (text) { console.error('[Shudu]', text); }
};

var isWasmReady = false;
var unconverted = [];
var conv_dict = new Map();
var browser = chrome;
var isProcessing = false;

// Dependencies list
const dependencies = [
    'STCharacters.ocd2',
    'STPhrases.ocd2',
    'TSCharacters.ocd2',
    'TSPhrases.ocd2',
    'TWPhrases.ocd2',
    'TWPhrasesRev.ocd2',
    'TWVariants.ocd2',
    'TWVariantsRev.ocd2',
    'TWVariantsRevPhrases.ocd2',
    's2twp.json',
    'tw2sp.json'
];

async function loadDependencies() {
    for (const file of dependencies) {
        const url = chrome.runtime.getURL('libs/opencc/' + file);
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
            const data = await response.arrayBuffer();
            globalThis.FS.writeFile(file, new Uint8Array(data));
        } catch (e) {
            console.error(`[Shudu] Failed to load ${file}:`, e);
            throw e; // Rethrow to signal initialization failure
        }
    }
}

browser.runtime.onMessage.addListener(handler);

// Defer auto-translation check to ensure pangu.js and opencc.js are loaded
setTimeout(checkAutoTranslation, 0);

function checkAutoTranslation() {
    chrome.storage.sync.get({
        autoTranslationURL: [],
    }, function (urls) {
        const href = window.location.href;
        if (urls.autoTranslationURL.some(item => href.includes(item))) {
            handler('shudu it');
        }
    })
}

async function handler(msg) {
    if (msg == 'shudu it') {
        if (isProcessing) return;

        // Wait for WASM to be ready with a timeout
        if (!isWasmReady) {
            try {
                // Wait up to 10 seconds for WASM to be ready
                await Promise.race([
                    wasmReadyPromise,
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('WASM initialization timeout')), 10000)
                    )
                ]);
            } catch (e) {
                console.error("[Shudu] WASM initialization failed:", e);
                alert('舒讀: 轉換引擎初始化失敗\n\n' + e.toString() + '\n\n請重新整理頁面再試一次。');
                return;
            }
        }

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

    // Get options
    const options = await new Promise(resolve => {
        chrome.storage.sync.get({
            lang: 'zh-TW',
            punctuation: 'fullWidth',
        }, resolve);
    });

    let configName = 's2twp.json';
    if (options.lang == 'zh') {
        configName = 'tw2sp.json';
    } else {
        configName = 's2twp.json';
    }

    // Convert
    const inputStr = unconverted.join('\n<<<<SHUDU_SEP>>>>\n');
    const inputFile = 'input.txt';
    const outputFile = 'output.txt';

    try {
        globalThis.FS.writeFile(inputFile, inputStr);

        const args = ['-i', inputFile, '-o', outputFile, '-c', configName];

        let runMain;
        if (typeof globalThis.callMain === 'function') {
            runMain = globalThis.callMain;
        } else if (typeof callMain === 'function') {
            runMain = callMain;
        } else if (Module.callMain) {
            runMain = Module.callMain;
        }

        if (!runMain) {
            throw new Error("Cannot find callMain function. OpenCC not initialized properly.");
        }

        const status = runMain(args);
        if (status !== 0) {
            throw new Error("OpenCC exited with status " + status);
        }

        if (globalThis.FS.analyzePath(outputFile).exists) {
            const outputContent = globalThis.FS.readFile(outputFile, { encoding: 'utf8' });
            let convertedArray = outputContent.split('\n<<<<SHUDU_SEP>>>>\n');

            // Punctuation handling using pangu
            if (options.punctuation === 'fullWidth' && typeof pangu !== 'undefined') {
                convertedArray = convertedArray.map(text => pangu.spacing(text));
            }

            setContent({ converted: convertedArray });
        } else {
            throw new Error("Output file not found.");
        }
    } finally {
        // Cleanup?
        try {
            if (globalThis.FS.analyzePath(inputFile).exists) globalThis.FS.unlink(inputFile);
            if (globalThis.FS.analyzePath(outputFile).exists) globalThis.FS.unlink(outputFile);
        } catch (e) { }
    }
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
        // msg.converted is array corresponding to unconverted
        if (msg.converted && msg.converted[k]) {
            conv_dict.set(v, msg.converted[k]);
            conv_dict.set(msg.converted[k], msg.converted[k]); // Set converted text as converted so we don't convert again
        }
    });
    replaceText();
    unconverted = [];
};

function traverse(nodes, handler) {
    if (!nodes) return;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (!node) continue;

        // nodeType 3 is Text node
        if (node.nodeType === 3) {
            handler(node, node.textContent);
        } else if (node.nodeType === 1) { // nodeType 1 is Element node
            const tagName = node.tagName.toUpperCase();
            // exclude metadata and non-text elements
            if (['STYLE', 'SCRIPT', 'NOSCRIPT', 'TEMPLATE', 'SVG', 'CANVAS', 'VIDEO', 'AUDIO', 'IFRAME', 'EMBED', 'OBJECT', 'MATH', 'HEAD'].includes(tagName)) {
                continue;
            }
            if (node.childNodes && node.childNodes.length > 0) {
                traverse(node.childNodes, handler);
            }
            // Shadow DOM support (only for open shadow roots)
            if (node.shadowRoot && node.shadowRoot.childNodes) {
                traverse(node.shadowRoot.childNodes, handler);
            }
        }
    }
}

function parsePage() {
    // Handle document title
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
    // Handle document title
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
