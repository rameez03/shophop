const express = require('express');
const router  = express.Router();
const path = require('path');
const multer = require('multer');
const ExpressError = require('../utils/ExpressError');
const funcAsync = require('../utils/funcAsync');
const ObjectId = require('mongodb').ObjectId;
const alert = require('alert')
const { productSchema } = require('../schemas.js');

const Seller = require('../models/seller')
const Product = require('../models/product')
const Order = require('../models/order')

const sellerLogin = (req, res, next) => {
	if(!req.session.seller_id){
		return res.redirect('/sellerlogin')
	}
	next();
}

const validateProduct = (req, res, next) => {
    const { error } = productSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const imagePath = path.join(__dirname, '../public/images');
        cb(null, imagePath);
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

var upload = multer({ storage: storage })

router.get('/home', sellerLogin, funcAsync(async(req, res) => {
	const seller_id = req.session.seller_id
	const seller = await Seller.findOne({ _id: seller_id })
	const username = seller.username
	var s_id = await ObjectId(seller_id)
	Product.find({ "soldby.id": s_id, listed: true }, function(err, sellerProducts){
        if(err){
           alert(err);
           next();
        } else {
           res.render('seller/home', { username , products: sellerProducts})
	}
        })
}))

router.get('/listitem', sellerLogin, (req, res) => {
	res.render('seller/listitem')
})

router.post('/listitem', sellerLogin, upload.array('product'), validateProduct, (req, res) => {
	var arr = []
	req.files.forEach(function(file){
		arr.push(file.filename)
	})
	console.log(arr)
	Seller.findOne({ _id: req.session.seller_id}, (err, seller)=>{
		if(err) {
		   alert(err);
		   next();
		}
		else{
			const seller_id = seller._id;
			const seller_name = seller.username;
			const {title, description, price, quantity, category } = req.body;
			const product = new Product({ title, description, price, quantity, category,
					soldby: { id: seller_id, username: seller_name },
					images: arr, listed: true}
			)
			product.save()
			res.redirect('home')
		}
	})
})

router.post('/changeprice/:id', sellerLogin, (req, res) => {
	Product.updateOne({ _id: req.params.id }, { $set: { price: req.body.newprice}}, function(err, buyer){
        if(err){
           alert(err);
           next();
        }
           res.redirect('/seller/home')
        })
})

router.post('/changeqty/:id', sellerLogin, (req, res) => {
	Product.updateOne({ _id: req.params.id }, { $set: { quantity: req.body.newqty}}, function(err, buyer){
        if(err){
           alert(err);
           next();
        } else {
           res.redirect('/seller/home')
        }
        })
})

router.post('/unlistitem/:id', sellerLogin, (req, res) => {
	Product.updateOne({ _id: req.params.id }, { $set: { listed: false }}, function(err, buyer){
        if(err){
           alert(err);
           next();
        } else {
           res.redirect('/seller/home')
        }
        })
})

router.get('/order', sellerLogin, (req, res) => {
	Order.find({ seller_id: req.session.seller_id }, function(err, orders){
		if(err){
		   alert(err);
		   next();
		}
		else{
			res.render('seller/order', { orders })
		}
        })
})

router.post('/updateorder/:id', sellerLogin, (req, res) => {
	console.log(req.params.status)
	Order.updateOne({ _id: req.params.id }, { $set: { status: req.body.status }}, function(err, buyer){
        if(err){
           alert(err);
           next();
        } else {
           res.redirect('/seller/order')
        }
        })
})

router.post('/logout', (req, res) => {
	if(req.session) {
		req.session.auth = null
		req.session.destroy()
	}
	res.redirect('/sellerlogin')
})

module.exports = router;
