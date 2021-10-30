const express = require('express');
const admin = require('firebase-admin');
bcrypt = require('bcrypt');
const path = require('path');

//firebase admin
let serviceAccount = require("./ecommerce-website-82e05-firebase-adminsdk-mmpa2-45dd6d8394.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

//aws cinfig
const AWS = require('aws-sdk');
const dotenv = require('dotenv');

dotenv.config();

//aws parameters

const region = "us-east-2";
const buketName = "ecom-web";
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

AWS.config.update({
    region,
    accessKeyId,
    secretAccessKey
});

//init s3

const s3 = new AWS.S3();

//generate image upload link

async function generateUrl(){
    let date = new Date();
    let id = parseInt(Math.random() * 10000000000);
    const imageName = `${id}${date.getTime()}.jpg`;

    const params = ({
        Bucket:buketName,
        Key:imageName,
        Expires:300,
        ContentType:'image/jpeg'
    })

    const uploadUrl = await s3.getSignedUrlPromise('putObject',params);
    return uploadUrl;
}

let db = admin.firestore();

//declarete static path
let staticPath = path.join(__dirname,"public");

//initializing express.js
const app = express();
app.use(express.static(staticPath));
app.use(express.json());

// signup route // 
app.get('/signup',function(req,res){
    res.sendFile(path.join(staticPath,"signup.html"));
})

app.post('/signup',function(req,res){
    console.log(req.body);
    let{name,email,password,number,tac,notifications} = req.body;

    //form validations
        if(name.length < 3){
            return res.json({'alert':'name must be 3 letters long'});
        }else if(!email.length){
            return res.json({'alert':'enter your email'});
        }else if(password.length < 8){
            return res.json({'alert':'password must contain 8 letters or more'});
        }else if(!number.length){
            return res.json({'alert':'enter your phone number'});
        }else if(!Number(number) || number.length < 10){
            return res.json({'alert':'invalid number, please enter valid one'});
        }else if(!tac){
            return res.json({'alert':'you must agree to our terms and conditions'});
        }

        //store user in db

        db.collection('users').doc(email).get()
        .then(user=>{
            if(user.exists){
                return res.json({'alert':'email already exists'});
            }else{
                // encrypt the password before storring it

                bcrypt.genSalt(10,(err,salt)=>{
                    bcrypt.hash(password,salt,(err,hash)=>{
                        req.body.password = hash;
                        db.collection('users').doc(email).set(req.body)
                        .then(data => {
                            res.json({
                                name:req.body.name,
                                email:req.body.email,
                                seller:req.body.seller,
                            })
                        })
                    });
                })
            }
        })
});

// login route //
app.get("/login",function(req,res){
    res.sendFile(path.join(staticPath,"login.html"));
})

app.post("/login",function(req,res){
    let {email,password} = req.body;

    if(!email.length || !password.length){
        res.json({'alert':'fill all the inputs'});
    }

    db.collection('users').doc(email).get()
    .then(user => {
        if(!user.exists){ // if email do not exists
            res.json({'alert': 'login email does not exists'})
        }else{
            bcrypt.compare(password,user.data().password, (err,result)=>{
                if(result){
                   let data = user.data();
                   return res.json({
                       name:data.name,
                       email:data.email,
                       seller:data.seller,
                   });
                } else{
                    return res.json({'alert': 'password incorrect'});
                }
            });
        }
    });
});

// home route // 
app.get("/", function(req,res){
    res.sendFile(path.join(staticPath,"index.html"));
});

// seller route

app.get("/seller", function(req,res){
    res.sendFile(path.join(staticPath,"seller.html"));
});

app.post("/seller", (req,res)=>{
    let {name,about,address,number,tac,legit,email} = req.body;
    if(!name.length || !address.length || !about.length || 
        number.length < 10 || !Number(number)){
            return res.json({'alert':'some information(s) is/are invalid'});
        }else if(!tac || !legit){
            return res.json({'alert':'you must agree to our terms and conditions'});
        }else{
            //update users seller status
            db.collection('sellers').doc(email).set(req.body)
            .then(data =>{
                db.collection('users').doc(email).update({
                    seller:true
                }).then(data=>{
                    res.json(true);
                })
            })
        }
})

//add product //
app.get('/add-product',(req,res)=>{
    res.sendFile(path.join(staticPath, "addProduct.html")); 
})

app.get('/add-product/:id',(req,res)=>{
    res.sendFile(path.join(staticPath, "addProduct.html")); 
})

app.post('/add-product',(req,res)=>{
    let{name,shortDes,des,images,sizes,actualPrice,discount,
        sellPrice,stock,tags,tac,email,draft,id}= req.body;
        //validation
      if(!draft){
        if(!name.length){
            return res.json({'alert':'enter product name'});
     }else if(shortDes.length > 100 || shortDes.length < 10 ){
         return res.json ({'alert':'short description must be between 10 to 100 letters'});
     }else if(!des.length){
         return res.json({'alert':'enter detail description about the product'});
     }else if(!images.length){ // image link array
         return res.json({'alert':'upload at leaset one product images'})
     }else if(!sizes.length){ // sizes array
         return res.json({'alert':'select at least one size'});
     }else if(!actualPrice.length || !discount.length || !sellPrice.length){
         return res.json({'alert':'you must add pricing'});
     }else if(stock<20){
         return res.json({'alert':'you must have at least 20 items in stock'});
     }else if(!tags.length){
         return res.json({'alert':'enter few tags to help ranking your product in search'});
     }else if(!tac){
         return res.json({'alert':'your must agree to our terms and condition'});
     }
      }

     let docName = id == undefined ? `${name.toLowerCase()}-${Math.floor(Math.random()*5000)}`: id;
     db.collection('products').doc(docName).set(req.body)
     .then(data=>{
         res.json({'product':name});
     })
     .catch(err => {
         return res.json({'alert':'some error accured. Try again'})
     })
})

//get the upload link
app.get('/s3url',(req,res)=>{
    generateUrl().then(url => res.json(url));
})

//get products

app.post('/get-products',(req,res)=>{
    let {email,id} = req.body;
    let docRef = id ? db.collection('products').doc(id) : db.collection('products').where('email','==',email);

    docRef.get()
    .then(products => {
        if(products.empty){
            return res.json('no products found');
        }
        let productsArray = [];
        if(id){
            return res.json(products.data());
        }else{
            products.forEach(item =>{
                let data = item.data();
                data.id = item.id;
                productsArray.push(data);
            })
            res.json(productsArray);
        }
    
    })
})

//delete 
app.post('/delete-product',(req,res)=>{
    let {id} = req.body;
    db.collection('products').doc(id).delete()
    .then(data => {
        res.json('success');
    }).catch(err =>{
        res.json('err');
    })
})

//404 rout // 
app.get("/404",function(req,res){
    res.sendFile(path.join(staticPath, "404.html")); 
})

app.use(function(req,res){
    res.redirect('/404');
})

app.listen(3000, function(){
    console.log('server is running on port 3000');
})