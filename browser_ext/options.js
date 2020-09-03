$(function() {
    $('select').formSelect();
    $('.tooltipped').tooltip();
    $('#add-auto-translation-url').click(newTranslationURL)
    $('form').keydown(function() {
        saveOptions();
    })
    $(".delete-ctud").click(deteleCTUD);
    $('form').change(function() {
        saveOptions();
    })

    $("#custom-translation-server").change(function() {
        if (this.checked) {
            $("#translation-server-div").show();
        } else {
            $("#translation-server-div").hide();
        }
    })

    loadOptions();
})

function loadOptions() {
    chrome.storage.sync.get({
        lang: 'zh-TW',
        punctuation: 'fullWidth',
        customTranslationServer: false,
        customTranslationServerURL: '',
        autoTranslationURL: [],
    }, function(items) {
        // 習慣語言
        $('#lang').val(items.lang);
        $('#lang').formSelect();

        // 標點符號
        $('#punctuation').val(items.punctuation);
        $('#punctuation').formSelect();

        // 自訂轉換伺服器
        $('#custom-translation-server')[0].checked = items.customTranslationServer;
        $("#custom-translation-server")[0].dispatchEvent(new Event('change'));

        $("#custom-translation-server-URL").val(items.customTranslationServerURL);

        // 頁面自動轉換
        items.autoTranslationURL.forEach((item) => {
            $('.atu:first').clone()
                .appendTo($('.custom-translation-url-div'))
                .children()[0].children[0].value = item;
        })
        $('.atu:first').hide();
        $(".delete-ctud").click(deteleCTUD);
        $('.tooltipped').tooltip();
    });
}

function saveOptions(e) {
    autoURL = new Set();
    $(".auto-translation-url").each(function(index, item) {
        if (item.value.trim().length > 0) autoURL.add(item.value)
    })

    chrome.storage.sync.set({
        lang: $("#lang")[0].value,
        punctuation: $("#punctuation")[0].value,
        customTranslationServer: $("#custom-translation-server")[0].checked,
        customTranslationServerURL: $("#custom-translation-server-URL")[0].value,
        autoTranslationURL: Array.from(autoURL),
    });
}

function newTranslationURL() {
    $('.atu:first').clone()
        .appendTo($('.custom-translation-url-div'))
        .show();
    $(".delete-ctud").click(deteleCTUD);
}

function deteleCTUD(e) {
    e.currentTarget.parentElement.parentElement.remove();
    $('.tooltipped').tooltip();
    saveOptions();
}