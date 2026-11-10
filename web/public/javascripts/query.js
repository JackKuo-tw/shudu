var virtualBody, originalContent = { text: [], index: [] };
var quill;

$(function () {
    // Initialize Quill
    quill = new Quill('#origin', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'clean']
            ]
        },
        placeholder: '請輸入欲轉換之文字...'
    });

    $('#convert button[type="submit"]').click(async function (e) {
        e.preventDefault();
        const $btn = $(this);
        const originalBtnText = $btn.html();
        
        // Set loading state
        quill.enable(false);
        $btn.prop('disabled', true).html('<svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg> 轉換中...');

        const origin = getContent();
        const punctuation = $('#punctuation').val();
        const translation = $('#translation').val();

        try {
            // Wait for WASM to be ready
            await window.shudu.ready;

            // Perform OpenCC conversion on CJK segments
            let converted = await window.shudu.convertText(origin, translation + '.json');

            setContent({ converted, punctuation });
        } catch (err) {
            console.error("[Conversion Error]", err);
            alert("轉換失敗: " + (err.message || "未知錯誤"));
        } finally {
            quill.enable(true);
            $btn.prop('disabled', false).html(originalBtnText);
        }
    });

    if (mobileCheck()) {
        const addonBtn = document.getElementById('addon');
        if (addonBtn) addonBtn.style.display = 'none';
    }
});

function getContent() {
    const parsed = [];
    originalContent.index = [];
    originalContent.text = parseHTML(quill.root.innerHTML);
    originalContent.text.forEach((text, index) => {
        if (ifCJK(text)) {
            parsed.push(text);
            originalContent.index.push(index);
        }
    });
    console.log('parsed', parsed);
    return parsed;
}

function setContent(msg) {
    const original = originalContent.text;
    originalContent.index.forEach((index, i) => {
        original.splice(index, 1, msg.converted[i]);
    });
    console.log('original', original);
    replaceText(original);

    // Apply pangu spacing across DOM when punctuation is fullWidth
    if (msg.punctuation === 'fullWidth' && typeof pangu !== 'undefined') {
        formatDomSpacing(virtualBody);
    }

    originalContent.index = [];
    originalContent.text = [];
    quill.root.innerHTML = virtualBody.innerHTML;
};

function parseHTML(htmlContent) {
    virtualBody = document.createElement('body');
    const mappingElement = [];
    virtualBody.innerHTML = htmlContent;
    const treeWalker = document.createTreeWalker(virtualBody, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null, false);
    const stringArr = [];
    while (treeWalker.nextNode()) {
        const node = treeWalker.currentNode;
        switch (node.nodeName.toLowerCase()) {
            case '#text':
                stringArr.push(node.textContent);
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
    const treeWalker = document.createTreeWalker(virtualBody, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null, false);
    let index = 0;
    while (treeWalker.nextNode()) {
        const node = treeWalker.currentNode;
        switch (node.nodeName.toLowerCase()) {
            case '#text':
                node.textContent = converted[index];
                index += 1;
                break;
            case 'option':
                node.text = converted[index];
                index += 1;
                break;
        }
    }
}

// 格式化 DOM 樹中的文字與標籤邊界空格
function formatDomSpacing(root) {
    if (typeof pangu === 'undefined') return;

    const blockTags = new Set(['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE', 'PRE', 'TD', 'TH', 'HR']);
    const inlineTags = new Set(['A', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'CODE', 'SPAN', 'SUB', 'SUP']);

    function getClosestBlock(node) {
        let curr = node;
        while (curr && curr !== root) {
            if (blockTags.has(curr.nodeName)) return curr;
            curr = curr.parentNode;
        }
        return root;
    }

    function getTopInlineAncestor(node, block) {
        let curr = node.parentNode;
        let topInline = null;
        while (curr && curr !== block && curr !== root) {
            if (inlineTags.has(curr.nodeName)) {
                topInline = curr;
            }
            curr = curr.parentNode;
        }
        return topInline;
    }

    // 1. 先處理個別 text node 內部的排版加空格
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    while (walker.nextNode()) {
        const textNode = walker.currentNode;
        if (textNode.textContent && textNode.textContent.length > 0) {
            textNode.textContent = pangu.spacing(textNode.textContent);
            textNodes.push(textNode);
        }
    }

    // 2. 處理同一個 block 內跨標籤（例如 <a>, <strong> 等行內標籤）邊界的加空格
    for (let i = 0; i < textNodes.length - 1; i++) {
        const nodeA = textNodes[i];
        const nodeB = textNodes[i + 1];

        const blockA = getClosestBlock(nodeA);
        const blockB = getClosestBlock(nodeB);
        if (blockA !== blockB) {
            continue;
        }

        const textA = nodeA.textContent;
        const textB = nodeB.textContent;
        if (!textA || !textB) continue;

        const charA = textA.slice(-1);
        const charB = textB.charAt(0);

        // 任一端已有空格或空白則跳過
        if (/\s/.test(charA) || /\s/.test(charB)) continue;

        const testStr = charA + charB;
        const spaced = pangu.spacing(testStr);

        if (spaced !== testStr) {
            const inlineA = getTopInlineAncestor(nodeA, blockA);
            const inlineB = getTopInlineAncestor(nodeB, blockB);

            if (inlineA && inlineB && inlineA !== inlineB) {
                // 兩側屬於不同行內標籤：在兩標籤中間插入文字空格節點
                const spaceNode = document.createTextNode(' ');
                inlineB.parentNode.insertBefore(spaceNode, inlineB);
            } else if (inlineB) {
                // nodeB 位於行內標籤中（例如 <a>）：將空格加在標籤外部（nodeA 結尾）
                nodeA.textContent = nodeA.textContent + ' ';
            } else if (inlineA) {
                // nodeA 位於行內標籤中（例如 <a>）：將空格加在標籤外部（nodeB 開頭）
                nodeB.textContent = ' ' + nodeB.textContent;
            } else {
                // 一般純文字節點間
                nodeA.textContent = nodeA.textContent + ' ';
            }
        }
    }
}

function ifCJK(text) {
    const REGEX_CHINESE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;
    const hasChinese = text.match(REGEX_CHINESE);
    if (hasChinese == null) return false;
    return true;
}

function mobileCheck() {
    let check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};
