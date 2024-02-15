console.log(chrome.i18n.getMessage("background_running"))

const browser = chrome
// const serverURL = "https://shudu.jackkuo.org/json";

// browser.browserAction.onClicked.addListener(handler);
// function handler(tab) {
//     browser.tabs.sendMessage(tab.id, 'shudu it');
// }
browser.action.onClicked.addListener(async (tab) => {
    // const { name } = await chrome.storage.local.get(["name"]);
    chrome.tabs.sendMessage(tab.id, 'shudu it');
});
  
browser.runtime.onMessage.addListener(sendText);


function convertText(text, config, isRefinePunc) {
    return window.convertText(text, config, isRefinePunc);
}

function sendText(msg) {
    // const server = msg.server || serverURL;

    // importScripts("wasm_exec.js",);

    const go = new Go();
    WebAssembly.instantiateStreaming(fetch("shudu.wasm"), go.importObject).then((result) => {
        go.run(result.instance);
    });

    console.log('received data:', msg);
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const inputText = msg.payload.origin;
        const configValue = msg.payload.translation;
        const isRefinePunc = msg.payload.punctuation === "fullWidth";
        console.log(inputText);
        console.log(configValue)
        console.log(isRefinePunc);
        const outputText = convertText(inputText, configValue, isRefinePunc);
        const tab = tabs[0];
        browser.tabs.sendMessage(tab.id, { status: 'success', resp: outputText });

        // fetch(server, {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify(msg.payload),
        //     }).then(res => {
        //         return res.json();
        //     })
        //     .then(resp => {
        //         console.log('resp:', resp);
        //         browser.tabs.sendMessage(tab.id, { status: 'success', resp });
        //     })
        //     .catch(err => {
        //         console.log('error:', err);
        //         browser.tabs.sendMessage(tab.id, { status: 'failure', resp: err.toString() });
        //     })
    });
}

// release notes
const version = 1.3;
chrome.storage.sync.get({
    whats_new: 'v0',
}, function(item) {
    if (item.whats_new !== version) {
        chrome.tabs.create({ url: "release_notes.html" });
        chrome.storage.sync.set({ whats_new: version });
    }
});