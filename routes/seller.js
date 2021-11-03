const express = require('express');
const router  = express.Router();
const Seller = require('../models/seller')
const Product = require('../models/product')

const sellerLogin = (req, res, next) => {
	if(!req.session.seller_id){
		return res.redirect('/sellerlogin')
	}
	next();
}

router.get('/home', sellerLogin, async(req, res) => {
	const seller_id = req.session.seller_id
	const seller = await Seller.findOne({ _id: seller_id })
	const username = seller.username
	Product.find({ soldby: { id: seller_id } }, function(err, sellerProducts){
        if(err){
           console.log(err);
        } else {
           console.log(seller_id)
           console.log(sellerProducts)
           res.render('seller/home', { username , products: sellerProducts})
	}
        })
})

router.get('/listitem', sellerLogin, (req, res) => {
	res.render('seller/listitem')
})

router.post('/listitem', sellerLogin, (req, res) => {
	res.send(req.body)
})

router.post('/logout', (req, res) => {
	req.session.destroy()
	res.redirect('/sellerlogin')
})

module.exports = router;
