const browserApi = (typeof browser !== 'undefined') ? browser : chrome;
const actionApi = (browserApi.action || browserApi.browserAction);

// WASM state managed in background — not subject to page CSP
let wasmReadyResolve, wasmReadyReject;
const wasmReadyPromise = new Promise((r, j) => { wasmReadyResolve = r; wasmReadyReject = j; });

const dependencies = [
    'STCharacters.ocd2', 'STPhrases.ocd2', 'TSCharacters.ocd2',
    'TSPhrases.ocd2', 'TWPhrases.ocd2', 'TWPhrasesRev.ocd2',
    'TWVariants.ocd2', 'TWVariantsRev.ocd2', 'TWVariantsRevPhrases.ocd2',
    's2twp.json', 'tw2sp.json'
];

// Must be defined before opencc.js loads
globalThis.Module = {
    locateFile(path) {
        return browserApi.runtime.getURL('libs/opencc/' + path);
    },
    onRuntimeInitialized: async function () {
        try {
            for (const file of dependencies) {
                const url = browserApi.runtime.getURL('libs/opencc/' + file);
                const response = await fetch(url);
                const data = await response.arrayBuffer();
                globalThis.FS.writeFile(file, new Uint8Array(data));
            }
            wasmReadyResolve();
            console.log('[Shudu Background] WASM ready');
        } catch (e) {
            console.error('[Shudu Background] Dependency load failed:', e);
            wasmReadyReject(e);
        }
    },
    onAbort(what) {
        wasmReadyReject(new Error('WASM aborted: ' + what));
    },
    print: (text) => console.log('[Shudu]', text),
    printErr: (text) => console.error('[Shudu]', text)
};

// Chrome MV3 service worker: load synchronously via importScripts
// Firefox MV2 background page: opencc.js loaded via manifest scripts array
if (typeof importScripts === 'function') {
    importScripts('libs/opencc/opencc.js');
}

actionApi.onClicked.addListener(function (tab) {
    browserApi.tabs.sendMessage(tab.id, 'shudu it');
});

browserApi.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg && msg.action === 'convert') {
        handleConvert(msg).then(sendResponse).catch(e => sendResponse({ error: e.message }));
        return true; // keep channel open for async response
    }
});

async function handleConvert({ texts, configName }) {
    await wasmReadyPromise;

    const inputStr = texts.join('\n<<<<SHUDU_SEP>>>>\n');
    globalThis.FS.writeFile('input.txt', inputStr);

    const runMain = (typeof callMain === 'function') ? callMain : Module.callMain;
    if (!runMain) throw new Error('OpenCC not initialized');

    const status = runMain(['-i', 'input.txt', '-o', 'output.txt', '-c', configName]);
    if (status !== 0) throw new Error('OpenCC exited with status ' + status);

    const output = globalThis.FS.readFile('output.txt', { encoding: 'utf8' });
    try { globalThis.FS.unlink('input.txt'); } catch (e) {}
    try { globalThis.FS.unlink('output.txt'); } catch (e) {}

    return { converted: output.split('\n<<<<SHUDU_SEP>>>>\n') };
}

// Release notes
const version = 1.4;
browserApi.storage.sync.get({ whats_new: 'v0' }, function (item) {
    if (item.whats_new !== version) {
        browserApi.tabs.create({ url: 'release_notes.html' });
        browserApi.storage.sync.set({ whats_new: version });
    }
});
