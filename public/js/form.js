//redirect to homepage if user is logged in
window.onload = ()=>{
    if(sessionStorage.user){
        user = JSON.parse(sessionStorage.user);
        if(compareToken(user.authToken, user.email)){
            location.replace('/');
        }
    }
}

const loader = document.querySelector('#loader');
// select inputs
const submitBtn = document.querySelector('.submit-btn');
const name = document.querySelector('#name') || null;
const email = document.querySelector('#email');
const password = document.querySelector('#password');
const number = document.querySelector('#number')|| null;
const tac = document.querySelector('#terms-and-cond')|| null;
const notification = document.querySelector('#notification')|| null;

submitBtn.addEventListener('click', function(){
if(name != null){ //signup page
    if(name.value.length < 3){
        showAlert('name must be 3 letters long');
    }else if(!email.value.length){
        showAlert('enter your email');
    }else if(password.value.length < 8){
        showAlert('password must contain 8 letters or more');
    }else if(!number.value.length){
        showAlert('enter your phone number');
    }else if(!Number(number.value) || number.value.length < 10){
        showAlert('invalid number, please enter valid one');
    }else if(!tac.checked){
        showAlert('you must agree to our terms and conditions');
    }else{
        //submit form
        loader.style.display='block';
        sendData('/signup',{
            name:name.value,
            email:email.value,
            password:password.value,
            number:number.value,
            tac:tac.checked,
            notifications:notifications.checked,
            seller:false
        })
    }
   }else{
       //login page
       if(!email.value.length || !password.value.length){
           showAlert('fill all the inputs');
       }else{
        loader.style.display='block';
        sendData('/login',{
            email:email.value,
            password:password.value
       })
    }
  }
});

// send data function

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

const processData = function(data){
    loader.style.display = null;
    if(data.alert){
        showAlert(data.alert);
    }else if(data.name){
       //create authToken
       data.authToken = generateToken(data.email);
       sessionStorage.user = JSON.stringify(data);
       location.replace('/');
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
}

