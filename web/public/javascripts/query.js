$(function(){
    $('#convert button[type="submit"]').click(function(e){						   	 
        e.preventDefault();
        var origin = $('#origin').val();
        var punctuation = $('#punctuation').val();
        var data = {'origin': origin, 'punctuation': punctuation};
        $.post("/json", data, function(data){
            greet(data);
        });
    });

    var greet = function(msg){
        $('#origin').val(msg.converted);
    };	   
});		 
