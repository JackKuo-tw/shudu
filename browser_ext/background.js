console.log(chrome.i18n.getMessage("background_running"))

const browser = chrome

browser.action.onClicked.addListener(handler);

function handler(tab) {
    browser.tabs.sendMessage(tab.id, 'shudu it');
}

// release notes
const version = 1.3;
chrome.storage.sync.get({
    whats_new: 'v0',
}, function (item) {
    if (item.whats_new !== version) {
        chrome.tabs.create({ url: "release_notes.html" });
        chrome.storage.sync.set({ whats_new: version });
    }
});
