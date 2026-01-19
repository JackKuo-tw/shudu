document.addEventListener('DOMContentLoaded', () => {
    localizeHtmlPage();

    const optionsForm = document.getElementById('options-form');
    if (optionsForm) {
        loadOptions();
        optionsForm.addEventListener('change', saveOptions);
        optionsForm.addEventListener('submit', (e) => e.preventDefault());
    }

    const addUrlBtn = document.getElementById('add-auto-translation-url');
    if (addUrlBtn) {
        addUrlBtn.addEventListener('click', newTranslationURL);
    }

    const urlDiv = document.querySelector('.custom-translation-url-div');
    if (urlDiv) {
        // Event delegation for delete buttons
        urlDiv.addEventListener('click', (e) => {
            if (e.target.closest('.delete-ctud')) {
                deleteCTUD(e);
            }
        });

        // Auto-save on input change for dynamic URLs
        urlDiv.addEventListener('input', (e) => {
            if (e.target.classList.contains('auto-translation-url')) {
                saveOptions();
            }
        });
    }
});

function loadOptions() {
    chrome.storage.sync.get({
        lang: 'zh-TW',
        punctuation: 'fullWidth',
        autoTranslationURL: [],
    }, (items) => {
        // Basic Settings
        document.getElementById('lang').value = items.lang;
        document.getElementById('punctuation').value = items.punctuation;

        // Auto Translation URLs
        const container = document.querySelector('.custom-translation-url-div');
        const template = container.querySelector('.atu');

        items.autoTranslationURL.forEach((url) => {
            const newItem = template.cloneNode(true);
            newItem.style.display = 'flex';
            newItem.querySelector('.auto-translation-url').value = url;
            container.appendChild(newItem);
        });
    });
}

function saveOptions() {
    const autoURL = new Set();
    document.querySelectorAll('.auto-translation-url').forEach((item) => {
        const val = item.value.trim();
        if (val.length > 0) {
            autoURL.add(val);
        }
    });

    chrome.storage.sync.set({
        lang: document.getElementById('lang').value,
        punctuation: document.getElementById('punctuation').value,
        autoTranslationURL: Array.from(autoURL),
    }, () => {
        console.log('Options saved');
    });
}

function newTranslationURL() {
    const container = document.querySelector('.custom-translation-url-div');
    const template = container.querySelector('.atu');
    const newItem = template.cloneNode(true);
    newItem.style.display = 'flex';
    newItem.querySelector('.auto-translation-url').value = '';
    container.appendChild(newItem);
    newItem.querySelector('.auto-translation-url').focus();
}

function deleteCTUD(e) {
    const item = e.target.closest('.atu-item');
    if (item) {
        item.remove();
        saveOptions();
    }
}

function localizeHtmlPage() {
    // Localize by replacing __MSG_***__ tags in the body
    // Using a more focused approach than replacing the whole HTML tag
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    const nodesToReplace = [];

    while (node = walk.nextNode()) {
        if (node.nodeValue.includes('__MSG_')) {
            nodesToReplace.push(node);
        }
    }

    nodesToReplace.forEach(textNode => {
        const newValue = textNode.nodeValue.replace(/__MSG_(\w+)__/g, (match, key) => {
            return chrome.i18n.getMessage(key) || match;
        });
        textNode.nodeValue = newValue;
    });

    // Also handle attributes like data-tooltip or placeholders if needed
    document.querySelectorAll('[data-tooltip]').forEach(el => {
        const attr = el.getAttribute('data-tooltip');
        if (attr.startsWith('__MSG_')) {
            const key = attr.replace(/__MSG_(\w+)__/, '$1');
            el.setAttribute('data-tooltip', chrome.i18n.getMessage(key));
        }
    });

    // Handle Title specifically
    document.title = document.title.replace(/__MSG_(\w+)__/g, (match, key) => {
        return chrome.i18n.getMessage(key) || match;
    });
}
