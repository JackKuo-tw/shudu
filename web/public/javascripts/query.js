$(function(){
    $('#convert button[type="submit"]').click(function(e){						   	 
        e.preventDefault();
        tinyMCE.activeEditor.setProgressState(true)
        var origin = tinyMCE.activeEditor.getContent({format : 'raw'})
        console.log(origin);
        var punctuation = $('#punctuation').val();
        var data = {'origin': origin, 'punctuation': punctuation};
        $.post("/json", data, function(data){
            greet(data);
        })
            .always(()=>{
                tinyMCE.activeEditor.setProgressState(false)
            })
            .fail(function() {
                alert( "轉換失敗" );
            });
    });

    var greet = function(msg){
        tinyMCE.activeEditor.setContent(msg.converted, {format: 'html'});
    };	   
    tinymce.init({
        selector: '#origin',
        branding: false,
        language: "zh_TW",
        language_url : '/public/javascripts/zh_TW.js'
    });
});		 
