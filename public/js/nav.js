const createNav = function(){
    let nav = document.querySelector('.navbar');

    nav.innerHTML= `<div class="nav">
    <img src="img/dark-logo.png" class="brand-logo" alt="">
    <div class="nav-items"><div class="search">
    <input type="text" class="search-box" placeholder="search brand, products">
    <button class="search-btn">search</button></div>
    <a><img src="img/user.png" id="user-img" alt="">
    <div class="login-logout-popup hide">
       <p class="account-info">log in as, name</p>
       <button class="btn" id="user-btn">Log out</button>
    </div>
    </a>
    <a href="#"><img src="img/cart.png" alt=""></a>
    </div></div><ul class="link-container">
    <li class="link-item"><a href="#" class="link">home</a>
    </li><li class="link-item"><a href="#" class="link">women</a></li>
    <li class="link-item"><a href="#" class="link">men</a></li>
    <li class="link-item"><a href="#" class="link">kids</a></li>
    <li class="link-item"><a href="#" class="link">accessories</a></li>
    </ul>`;
}

createNav();

//nav popup

const userImageButton = document.querySelector('#user-img');
const userPopup = document.querySelector('.login-logout-popup');
const popuptext = document.querySelector('.account-info');
const actionBtn = document.querySelector('#user-btn');

userImageButton.addEventListener('click',function(){
    userPopup.classList.toggle('hide');
})

window.onload = function(){
    let user = JSON.parse(sessionStorage.user || null);
    if(user != null){
        //means user is logged in
        popuptext.innerHTML = `log in as, ${user.name}`;
        actionBtn.innerHTML = `log out`;
        actionBtn.addEventListener('click',function(){
            sessionStorage.clear();
            location.reload();
        })
    }else{
        //user is logged out
        popuptext.innerHTML = `log in to place an order`;
        actionBtn.innerHTML = `log in`;
        actionBtn.addEventListener('click',function(){
            location.href = '/login';
        })
    }
}