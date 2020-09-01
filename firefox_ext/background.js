console.log("background is running...");

var browser = browser || chrome

browser.browserAction.onClicked.addListener(handler);
browser.runtime.onMessage.addListener(sendText);

function handler(tab) {
    browser.tabs.sendMessage(tab.id, 'shudu it');
}

function sendText(data) {
    console.log('received data:', data);
    browser.tabs.query({ active: true, windowId: browser.windows.WINDOW_ID_CURRENT })
        .then(tabs => browser.tabs.get(tabs[0].id))
        .then(tab => {
            fetch("https://shudu.jackkuo.org/json", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                }).then(res => {
                    return res.json();
                })
                .catch(err => { alert("轉換失敗"); })
                .then(resp => {
                    console.log(resp);
                    browser.tabs.sendMessage(tab.id, resp);
                })
        });
}