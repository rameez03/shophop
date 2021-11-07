const express = require('express');
const router  = express.Router();
const multer = require('multer');
const path = require('path');

const Buyer = require('../models/buyer')
const Seller = require('../models/seller')

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const docPath = path.join(__dirname, '../public/documents');
        cb(null, docPath);
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

var upload = multer({ storage: storage })

router.get('/', (req, res) => {
	res.render('landing')
})

router.get('/aboutus', (req, res) => {
	res.render('about')
})

router.get('/signup', (req, res) => {
	res.render('buyersignup')
})

router.post('/signup', async(req, res) => {
	const { username, email, password } = req.body;
	const buyer = new Buyer({ username, email, password })
	await buyer.save();
	res.redirect('/login')
})

router.get('/login', (req, res) => {
	res.render('buyerlogin')
	req.session.destroy()
})

router.post('/login', async(req, res) => {
	const { email, password } = req.body;
	const foundBuyer = await Buyer.validateBuyer(email, password)
	if(foundBuyer){
		req.session.buyer_id = foundBuyer._id
		res.redirect('/buyer/home')
	}
	else{
		res.redirect('/login')
	}
})

router.get('/sellersignup', (req, res) => {
	res.render('sellersignup')
})

router.post('/sellersignup', upload.single('doc'), async(req, res) => {
	var document = req.file.filename
	const { username, email, password, phone, city } = req.body;
	var isApproved = false
	const seller = new Seller({ username, email, password, phone, city, document, isApproved })
	await seller.save();
	res.redirect('/sellerlogin')
})

router.get('/sellerlogin', (req, res) => {
	res.render('sellerlogin')
	req.session.destroy()
})

router.post('/sellerlogin', async(req, res) => {
	const { email, password } = req.body;
	const sellerExist = await Seller.findOne({ email });
	if(sellerExist){
		const sellerApproved = sellerExist.isApproved
		if(!sellerApproved){
			res.send('seller not approved')
		}
		else{
			const foundSeller = await Seller.validateSeller(email, password)
			if(foundSeller){
				req.session.seller_id = foundSeller._id
				res.redirect('/seller/home')
			}
			else{
				res.redirect('/sellerlogin')
			}
		}
	}
	else {
		res.redirect('/sellerlogin')
	}
})

router.post('/logout', (req, res) => {
	if(req.session) {
		req.session.auth = null
		req.session.destroy()
	}
	res.redirect('/')
})

module.exports = router;
