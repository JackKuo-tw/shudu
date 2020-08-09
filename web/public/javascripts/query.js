$(function(){
    $('#convert button[type="submit"]').click(function(e){						   	 
        e.preventDefault();
        var origin = tinyMCE.activeEditor.getContent({format : 'raw'})
        console.log(origin);
        var punctuation = $('#punctuation').val();
        var data = {'origin': origin, 'punctuation': punctuation};
        $.post("/json", data, function(data){
            greet(data);
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
