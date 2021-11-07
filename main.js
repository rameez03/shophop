const express = require('express');
const router  = express.Router();
const nodemailer=require('nodemailer');
let alert = require('alert');
const flash=require('connect-flash');
const bcrypt=require('bcrypt')

const Buyer = require('../models/buyer')
const Seller = require('../models/seller')
const Otp= require('../models/otp')
const OtpSeller= require('../models/otpSeller')

router.get('/', (req, res) => {
	res.render('landing')
})

router.get('/aboutus', (req, res) => {
	res.render('about')
})

router.get('/signup', (req, res) => {
	res.render('buyersignup')
})
var otpemail;

router.post('/signup',async(req,res)=>{
	try{
        if(req.body.password == req.body.confirmpassword){
        const{username,email,dob,password}=req.body;
        const buyer = new Buyer({username,email,dob,password})
        await buyer.save();
        alert("Signed up Successfully");
        res.redirect('/login')
        }
        else{
            alert("Password does not match!!");
            res.redirect('/signup')
        }
	
	}
	catch(err){
		next(err)
	}
})
let transporter = nodemailer.createTransport({
   port: 465,
   secure: true,
   service : 'Gmail',
   
   auth: {
     user: 'fcsiiitd@gmail.com',
     pass: 'FCS_2021',
   }
});


router.post('/send',async function(req,res,next){
    try{
   otpemail = Math.random();
   otpemail = otpemail * 100000000;
   otpemail = parseInt(otpemail);
   console.log(otpemail);
    
    var otpemail2=String(otpemail);
   email=req.body.email;
   const flag=await Otp.findOne({email},{_id:true});
   if(flag!=null){

    var newhash= await bcrypt.hash(otpemail2, 12);   
    Otp.updateOne({email},{$set:{otpemail:newhash,time:Date.now()}})
    .then(()=>{
        
    });
        
   }
   else{
    var time=Date.now();
        const otp= new Otp({email,otpemail,time})
        await otp.save();
   }
    // send mail with defined transport object
   var mailOptions={
      to: req.body.email,
      subject: "Otp for registration is: ",
      html: "<h3>OTP for account verification is </h3>"  + "<h1 style='font-weight:bold;'>" + otpemail +"</h1>" // html body
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
       if (error) {
           return console.log(error);
       }
       console.log('Message sent: %s', info.messageId);   
       console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
   });
}
catch(err){
    next(err)
}
  
});

router.post('/verifylogin',async function(req,res){
    
    const {time} =await Otp.findOne({email:req.body.email},{time:true}) 
    if(Date.now()<(time+Number(120000))){
        const { email, otpemail } = req.body;
        const foundOtp = await Otp.validateOtp(email, otpemail)
        if(foundOtp){
            const val=Buyer.findOne({email:req.body.email});
            if (val!=null){
                Buyer.findOneAndUpdate({query:{email:req.body.email},update:{isverified:true}})
                alert("OTP verified");
            }
            else{
                alert("no such user exist")
            }
        }
        else{
            alert("Incorrect OTP ");
        }
    }
    else{
        alert("Otp timed out!! click Resend OTP ");
    }
})
router.post('/verify',async function(req,res){
    email=req.body.email;
    
    const {otpemail,time} =await Otp.findOne({email},{otpemail:true,time:true}) 
    if(Date.now()<(time+Number(120000))){
        
        const { email, otpemail } = req.body;
        const foundOtp = await Otp.validateOtp(email, otpemail)
        if(foundOtp){
                alert("OTP verified");
        }
        else{
            alert("Incorrect OTP ");
        }
    }
    else{
        alert("Otp timed out!! click Resend OTP ");
    }
})
  

router.post('/resend',async function(req,res){
	
    try{
        otpemail = Math.random();
        otpemail = otpemail * 100000000;
        otpemail = parseInt(otpemail);
        console.log(otpemail);
         
         var otpemail2=String(otpemail);
        email=req.body.email;
        const flag=await Otp.findOne({email},{_id:true});
        if(flag!=null){     
         var newhash= await bcrypt.hash(otpemail2, 12);     
         Otp.updateOne({email},{$set:{otpemail:newhash,time:Date.now()}})
         .then(()=>{
             
         });  
        }
        else{
         var time=Date.now();
             const otp= new Otp({email,otpemail,time})
             await otp.save();
        }
    var mailOptions={
        to: req.body.email,
       subject: "Otp for registration is: ",
       html: "<h3>OTP for account verification is </h3>"  + "<h1 style='font-weight:bold;'>" + otpemail +"</h1>" // html body
     };
     
     transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);   
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        res.render({msg:"otp has been sent"});
    });
}
    catch(err){
        next(err)
    }

})

router.get('/login', (req, res) => {
	res.render('buyerlogin')
	req.session.destroy()
})

router.get('/forgotpassword',(req,res)=>{
	res.render('forgotpassword')
})
router.post('/login', async(req, res) => {
	
		const { email, password } = req.body;
		const foundBuyer = await Buyer.validateBuyer(email, password)
		if(foundBuyer){
			req.session.buyer_id = foundBuyer._id
			res.redirect('/buyer/home')
		}
})

router.get('/sellersignup', (req, res) => {
	res.render('sellersignup')
})

router.post('/sellersignup', async(req, res) => {
	const { username, email, password, phone, city } = req.body;
	const seller = new Seller({ username, email, password, phone, city })
	await seller.save();
	res.redirect('/sellerlogin')
})

router.get('/sellerlogin', (req, res) => {
	res.render('sellerlogin')
	req.session.destroy()
})

router.post('/sellerlogin', async(req, res) => {
	const { email, password } = req.body;
	const foundSeller = await Seller.validateSeller(email, password)
	if(foundSeller){
		req.session.seller_id = foundSeller._id
		res.redirect('/seller/home')
	}
	else{
		res.redirect('/sellerlogin')
	}
})

router.post('/logout', (req, res) => {
	const buyer_id = req.session.buyer_id
    Buyer.findOneAndUpdate({query:{_id:buyer_id},update:{isverify:false}})
	req.session.destroy()
	res.redirect('/')
})
router.post('/forgotpassword',async function(req,res){

    email=req.body.email;
    
    const {otpemail,time} =await Otp.findOne({email},{otpemail:true,time:true}) 
    if(Date.now()<(time+Number(120000))){
        const { email, otpemail } = req.body;
        const foundOtp = await Otp.validateOtp(email, otpemail)
        if(foundOtp){
                if(Buyer.findOne({email:req.body.email},{dob:req.body.dob})){
                const email=req.param('email');
                res.render('newpassword', {email:email})
            }
            else{
                alert("Incorrect OTP or No such user exist!! ");
                res.render('forgotpassword');
            }
        }
    }
        else{
            alert("Otp timed out!! click Resend OTP ");
        }
    
})

router.get('/newpassword', (req, res) => {
	res.render('newpassword')
})
router.post('/newpassword',async function(req,res){
    const {newpassword,confirmpassword}=req.body;
    if (newpassword==confirmpassword){
        const buyer=await Buyer.findOne({email},{_id:true});
        var newhash= await bcrypt.hash(newpassword, 12);      
        Buyer.updateOne({email},{$set:{password:newhash}})
        .then(()=>{
            alert("updated successfully");
        });
   res.redirect('/login')
    }
    else{
        alert("Password do not match ");
        res.render("newpassword");
    }
})



//seller function
router.post('/sellersend',async function(req,res,next){
    try{
   otpemail = Math.random();
   otpemail = otpemail * 100000000;
   otpemail = parseInt(otpemail);
   console.log(otpemail);
    
    var otpemail2=String(otpemail);
   email=req.body.email;
   const flag=await OtpSeller.findOne({email},{_id:true});
   if(flag!=null){

    var newhash= await bcrypt.hash(otpemail2, 12);   
    OtpSeller.updateOne({email},{$set:{otpemail:newhash,time:Date.now()}})
    .then(()=>{
        
    });
        
   }
   else{
    var time=Date.now();
        const otpSeller= new OtpSeller({email,otpemail,time})
        await otpSeller.save();
   }
    // send mail with defined transport object
   var mailOptions={
      to: req.body.email,
      subject: "Otp for registration is: ",
      html: "<h3>OTP for account verification is </h3>"  + "<h1 style='font-weight:bold;'>" + otpemail +"</h1>" // html body
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
       if (error) {
           return console.log(error);
       }
       console.log('Message sent: %s', info.messageId);   
       console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
   });
}
catch(err){
    next(err)
}
  
});
router.post('/sellerverifylogin',async function(req,res){
    email=req.body.email;
    
    const {time} =await OtpSeller.findOne({email},{time:true})
    if(Date.now()<(time+Number(120000))){
        const { email, otpemail } = req.body;
        const foundOtpSeller = await OtpSeller.validateOtpSeller(email, otpemail)
        if(foundOtpSeller){
            const val=Seller.findOne({email:req.body.email});
            if (val!=null){
                Seller.findOneAndUpdate({query:{email:req.body.email},update:{isverified:true}})
                alert("OTP verified");
            }
            else{
                alert("no such user exist")
            }
        }
        else{
            alert("Incorrect OTP ");
        }
    }
    else{
        alert("Otp timed out!! click Resend OTP ");
    }
})
router.post('/sellerresend',async function(req,res){
	
    try{
        otpemail = Math.random();
        otpemail = otpemail * 100000000;
        otpemail = parseInt(otpemail);
        console.log(otpemail);
         
         var otpemail2=String(otpemail);
        email=req.body.email;
        const flag=await OtpSeller.findOne({email},{_id:true});
        if(flag!=null){     
         var newhash= await bcrypt.hash(otpemail2, 12);     
         OtpSeller.updateOne({email},{$set:{otpemail:newhash,time:Date.now()}})
         .then(()=>{
             
         });  
        }
        else{
         var time=Date.now();
             const otpSeller= new OtpSeller({email,otpemail,time})
             await otpSeller.save();
        }
    var mailOptions={
        to: req.body.email,
       subject: "Otp for registration is: ",
       html: "<h3>OTP for account verification is </h3>"  + "<h1 style='font-weight:bold;'>" + otpemail +"</h1>" // html body
     };
     
     transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);   
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        res.render({msg:"otp has been sent"});
    });
}
    catch(err){
        next(err)
    }
})


router.get('/forgotpasswordseller',(req,res)=>{
	res.render('forgotpasswordseller')
})

router.post('/forgotpasswordseller',function(req,res){

    if(req.body.otpemail!=otpemail){
        alert("Incorrect OTP ");
        res.render('forgotpasswordseller');
    }
    else{
      
        if(Seller.findOne({email:req.body.email},{phone:req.body.phone})){
            const email=req.param('email');
            res.render('newpasswordseller', {email:email})
        }
    }
})

router.get('/newpasswordseller', (req, res) => {
	res.render('newpasswordseller')
})
router.post('/newpasswordseller',async function(req,res){
    const {newpassword,confirmpassword}=req.body;
    if (newpassword==confirmpassword){
        const seller=await Seller.findOne({email},{_id:true});
        var newhash= await bcrypt.hash(newpassword, 12);      
        Seller.updateOne({email},{$set:{password:newhash}})
        .then(()=>{
            alert("updated successfully");
        });
   res.redirect('/sellerlogin')
    }
    else{
        alert("Password do not match ");
        res.render("newpasswordseller");
    }
})


module.exports = router;
