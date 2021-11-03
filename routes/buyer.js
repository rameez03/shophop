const express = require('express');
const router  = express.Router();
const Buyer = require('../models/buyer')
const Product = require('../models/product')

const buyerLogin = (req, res, next) => {
	if(!req.session.buyer_id){
		return res.redirect('/login')
	}
	next();
}

router.get('/home', buyerLogin, async(req, res) => {
	const buyer_id = req.session.buyer_id
	const buyer = await Buyer.findOne({ _id: buyer_id })
	const username = buyer.username
	Product.find({}, function(err, allProducts){
        if(err){
           console.log(err);
        } else 
           res.render('buyer/home', { username , products: allProducts})
        })
})

router.get('/cart', buyerLogin, (req, res) => {
	Buyer.findOne({ _id: req.session.buyer_id }, function(err, buyer){
        if(err){
           console.log(err);
        } else {
           Product.find({ _id: buyer.cart_items }, function(err, items){
           if(err){
		   console.log(err);
		} else {
		   res.render('buyer/cart', { buyer, items, sum: 25 })
		}
           })
        }
        })
})

router.post('/addtocart/:id', buyerLogin, (req, res) => {
	Buyer.updateOne({ _id: req.session.buyer_id }, { $push: {cart_items: req.params.id }}, function(err, buyer){
        if(err){
           console.log(err);
        } else {
           res.redirect('/home')
        }
        })
})

router.post('/logout', (req, res) => {
	req.session.destroy()
	res.redirect('/login')
})

module.exports = router;
