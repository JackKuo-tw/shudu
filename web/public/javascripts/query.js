$(function(){
    $('#convert button[type="submit"]').click(function(e){						   	 
        e.preventDefault();
        var origin = $("#origin").val();
        var data = {'origin': origin};
        $.post("/json", data, function(data){
            greet(data);
        });
    });

    var greet = function(msg){
        $('#origin').val(msg.converted);
    };	   
});		 
