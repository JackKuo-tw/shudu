const browserApi = (typeof browser !== 'undefined') ? browser : chrome;
console.log(browserApi.i18n.getMessage("background_running"))
const actionApi = (browserApi.action || browserApi.browserAction);

actionApi.onClicked.addListener(handler);

function handler(tab) {
    browserApi.tabs.sendMessage(tab.id, 'shudu it');
}

// release notes
const version = 1.4;
browserApi.storage.sync.get({
    whats_new: 'v0',
}, function (item) {
    if (item.whats_new !== version) {
        browserApi.tabs.create({ url: "release_notes.html" });
        browserApi.storage.sync.set({ whats_new: version });
    }
});
