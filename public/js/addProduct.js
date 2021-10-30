let user = JSON.parse(sessionStorage.user || null);
let loader = document.querySelector('.loader');

//checking if user is logged in or not
window.onload = () =>{
    if(user){
        if(!compareToken(user.authtoken,user.email)){
            location.replace('/login');
        }
    }else{
        location.replace('/login');
    }
}

//price inputs

const actualPrice = document.querySelector('#actual-price');
const discountPercentage = document.querySelector('#discount');
const sellingPrice = document.querySelector('#sell-price');

discountPercentage.addEventListener('input',()=>{
    if(discountPercentage.value > 100){
        discountPercentage.value = 90;
    }else{
        let discount = discountPercentage.value * actualPrice.value / 100;
        sellingPrice.value = actualPrice.value - discount;
    }
})

sellingPrice.addEventListener('input',()=>{
    let discount = (sellingPrice.value/actualPrice.value) * 100;
    discountPercentage.value = discount;
})

//upload image handle 

let uploadImage  = document.querySelectorAll('.fileupload');
imagePaths = []; // will store all uploaded images paths

uploadImage.forEach((fileupload,index)=>{
    fileupload.addEventListener('change',()=>{
        const file = fileupload.files[0];
        let imageUrl;

        if(file.type.includes('image')){
            fetch('/s3url').then(res=>res.json())
            .then(url=>{
                fetch(url,{
                    method:'PUT',
                    headers: new Headers({'Content-Type':'multipart/form-data'}),
                    body: file
                }).then(res=>{
                    imageUrl = url.split("?")[0];
                    imagePaths[index] = imageUrl;
                    let label = document.querySelector(`label[for=${fileupload.id}]`);
                    label.style.backgroundImage = `url(${imageUrl})`;
                    let productImage = document.querySelector('.product-image');
                    productImage.style.backgroundImage = `url(${imageUrl})`;
                })
            })
        }else {
            showAlert('Upload image only');
        }
    })
})

// form submission 

const productName = document.querySelector('#product-name');
const shortLine = document.querySelector('#short-des');
const des = document.querySelector('#des');

let sizes =[]; //will store all the sizes

const stock = document.querySelector('#stock');
const tags = document.querySelector('#tags');
const tac = document.querySelector('#tac');

//buttons
const addProductBtn = document.querySelector('#add-btn');
const saveDraft = document.querySelector('#save-btn');

//store size function
const storeSizes = () => {
    sizes = [];
    let sizeCheckbox = document.querySelectorAll('.size-checkbox');
    sizeCheckbox.forEach(item =>{
        if (item.checked){
            sizes.push(item.value);
        }
    })
}

const validateFrom = () =>{
    if(!productName.value.length){
       return showAlert('enter product name');
}else if(shortLine.value.length > 100 || shortLine.value.length < 10 ){
    return showAlert ('short description must be between 10 to 100 letters');
}else if(!des.value.length){
    return showAlert('enter detail description about the product');
}else if(!imagePaths.length){ // image link array
    return showAlert('upload at leaset one product images')
}else if(!sizes.length){ // sizes array
    return showAlert('select at least one size');
}else if(!actualPrice.value.length || !discount.value.length || !sellingPrice.value.length){
    return showAlert('you must add pricing');
}else if(stock.value<20){
    return showAlert('you must have at least 20 items in stock');
}else if(!tags.value.length){
    return showAlert('enter few tags to help ranking your product in search');
}else if(!tac.checked){
    return showAlert('your must agree to our terms and condition');
}

return true;
       
}

const productData = () =>{
    return data ={
        name:productName.value,
        shortDes:shortLine.value,
        des:des.value,
        images:imagePaths,
        sizes:sizes,
        actualPrice:actualPrice.value,
        discount:discountPercentage.value,
        sellPrice:sellingPrice.value,
        stock:stock.value,
        tags:tags.value,
        tac:tac.checked,
        email:user.email

    }
}

addProductBtn.addEventListener('click', () =>{
    storeSizes();
   // validate form
   if(validateFrom()){ // valotateForm return true or fales while doing validation
        loader.style.display = 'block';
        let data = productData();
        if(productId){
            data.id=productId;
        }
        sendData('/add-product', data);
   }
});

saveDraft.addEventListener('click',()=>{
    //store sizes
    storeSizes();
    //check for product name
    if(!productName.value.length){
        showAlert('enter product name');
    }else{// dont validate data
        let data = productData();
        data.draft = true;
        if(productId){
            data.id=productId;
        }
        sendData('/add-product', data);
    }

})

//existing product detail handle

const setFormsData = (data) =>{
    productName.value = data.name;
    shortLine.value = data.shortDes;
    des.value = data.des;
    actualPrice.value = data.actualPrice;
    discountPercentage.value = data.discount;
    sellingPrice.value = data.sellPrice;
    stock.value = data.stock;
    tags.value = data.tags;

    //set up images
    imagePaths = data.images;
    imagePaths.forEach((url,i)=>{
        let label = document.querySelector(`label[for=${uploadImage[i].id}]`);
        label.style.backgroundImage = `url(${url})`;
        let productImage = document.querySelector('.product-image');
        productImage.style.backgroundImage = `url(${url})`;
    })

    //set up sizes
    sizes = data.sizes;
    let sizesCheckbox = document.querySelectorAll('.size-checkbox');
    sizesCheckbox.forEach(item =>{
        if(sizes.includes(item.value)){
            item.setAttribute('checked','')
        }
    })
}

const fetchProductData = () =>{
    //delete the tempProduct fron the session
    delete sessionStorage.tempProduct;
    fetch('/get-products',{
        method:'post',
        headers:new Headers({'Content-Type':'application/json'}),
        body: JSON.stringify({email:user.email, id:productId})
    })
    .then((res)=> res.json())
    .then(data =>{
        setFormsData(data);
    })
    .catch(err=>{
        locatin.replace('/seller');
    })
}

let productId = null;
if(location.pathname != '/add-product'){
    productId = decodeURI(location.pathname.split('/').pop());

    let productDetail = JSON.parse(sessionStorage.tempProduct || null);
    //fetch the data if product is not in session
    //if(productDetail == null){
        fetchProductData();
    //}
}


