console.log(chrome.i18n.getMessage("background_running"))

const browser = chrome
const serverURL = "https://shudu.jackkuo.org/json";

browser.browserAction.onClicked.addListener(handler);
browser.runtime.onMessage.addListener(sendText);

function handler(tab) {
    browser.tabs.sendMessage(tab.id, 'shudu it');
}

function sendText(msg) {
    const server = msg.server || serverURL;

    console.log('received data:', msg);
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const tab = tabs[0];

        fetch(server, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msg.payload),
            }).then(res => {
                return res.json();
            })
            .then(resp => {
                console.log('resp:', resp);
                browser.tabs.sendMessage(tab.id, { status: 'success', resp });
            })
            .catch(err => {
                console.log('error:', err);
                browser.tabs.sendMessage(tab.id, { status: 'failure', resp: err.toString() });
            })
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