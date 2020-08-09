a = document.getElementsByTagName('a')
function trans(arr){						   	 
    text = [];
    for(let i=0; i< arr.length;i++){
        text.push(arr[i].text);
    }
    var data = {'origin': text, 'punctuation': 'fullWidth'};
    fetch("https://shudu.jackkuo.org/json", {
        body: JSON.stringify(data),
        method: 'POST',
        mode: 'cors'
    }
    ).then((data) => 
    {
        for(let i=0; i< arr.length;i++){
            arr[i].text = data[i];
        }
    });
};
trans(a);
