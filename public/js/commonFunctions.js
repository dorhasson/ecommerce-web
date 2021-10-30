//common function 

//send data function

const sendData = function(path,data){
    fetch(path,{
        method:'post',
        headers: new Headers({'Content-Type':'application/json'}),
        body: JSON.stringify(data)
    }).then((res)=>res.json())
    .then(response => {
        processData(response);
    });
}

// process data function 

const processData = function(data){
    console.log(data);
    loader.style.display = null;
    if(data.alert){
        showAlert(data.alert);
    }else if(data.name){
       //create authToken
       data.authToken = generateToken(data.email);
       sessionStorage.user = JSON.stringify(data);
       location.replace('/');
    }else if(data == true){
        //seller page 
        let user = JSON.parse(sessionStorage.user);
        user.seller = true;
        sessionStorage.user = JSON.stringify(user);
        location.reload();
    }else if(data.product){
        location.href = '/seller';
    }
}

//alert function

const showAlert = function(msg){
    let alertBox = document.querySelector('.alert-box');
    let alertMsg = document.querySelector('.alert-msg');

    alertMsg.innerHTML = msg;
    alertBox.classList.add('show');
    setTimeout(function(){
        alertBox.classList.remove('show');
    },3000);
    return false;
}