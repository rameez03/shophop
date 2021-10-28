const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const Buyer = require('./models/buyer')
const Seller = require('./models/seller')
const Product = require('./models/product')

mongoose.connect('mongodb://localhost:27017/shophop', { useNewUrlParser: true })
	.then(()=>{
		console.log("Connected to database")
	})
	.catch((err)=>{
		console.log("Error")
		console.log(err)
	})

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'))

app.use(express.urlencoded({ extended: true }));
app.use(express.static( "public" ));
app.use(session({ secret: 'thisaverygoodsecret'} ))

const buyerLogin = (req, res, next) => {
	if(!req.session.buyer_id){
		return res.redirect('/login')
	}
	next();
}

const sellerLogin = (req, res, next) => {
	if(!req.session.seller_id){
		return res.redirect('/sellerlogin')
	}
	next();
}

app.get('/', (req, res) => {
	res.render('landing')
})

app.get('/aboutus', (req, res) => {
	res.render('about')
})

app.get('/signup', (req, res) => {
	res.render('buyersignup')
})

app.post('/signup', async(req, res) => {
	const { username, email, password } = req.body;
	const buyer = new Buyer({ username, email, password })
	await buyer.save();
	res.redirect('/login')
})

app.get('/login', (req, res) => {
	res.render('buyerlogin')
	req.session.destroy()
})

app.post('/login', async(req, res) => {
	const { email, password } = req.body;
	const foundBuyer = await Buyer.validateBuyer(email, password)
	if(foundBuyer){
		req.session.buyer_id = foundBuyer._id
		res.redirect('/home')
	}
	else{
		res.redirect('/login')
	}
})

app.get('/home', buyerLogin, async(req, res) => {
	const buyer_id = req.session.buyer_id
	const buyer = await Buyer.findOne({ _id: buyer_id })
	const username = buyer.username
	Product.find({}, function(err, allProducts){
        if(err){
           console.log(err);
        } else 
           res.render('buyerhome', { username , products: allProducts})
        })
})

app.get('/cart', buyerLogin, (req, res) => {
	Buyer.findOne({ _id: req.session.buyer_id }, function(err, buyer){
        if(err){
           console.log(err);
        } else {
           Product.find({ _id: buyer.cart_items }, function(err, items){
           if(err){
		   console.log(err);
		} else {
		   res.render('cart', { buyer, items })
		}
           })
        }
        })
})

app.post('/addtocart/:id', buyerLogin, (req, res) => {
	Buyer.updateOne({ _id: req.session.buyer_id }, { $push: {cart_items: req.params.id }}, function(err, buyer){
        if(err){
           console.log(err);
        } else {
           res.redirect('/home')
        }
        })
})

app.post('/logout', (req, res) => {
	req.session.destroy()
	res.redirect('/login')
})

app.get('/sellersignup', (req, res) => {
	res.render('sellersignup')
})

app.post('/sellersignup', async(req, res) => {
	const { username, email, password, phone, city } = req.body;
	const seller = new Seller({ username, email, password, phone, city })
	await seller.save();
	res.redirect('/sellerlogin')
})

app.get('/sellerlogin', (req, res) => {
	res.render('sellerlogin')
	req.session.destroy()
})

app.post('/sellerlogin', async(req, res) => {
	const { email, password } = req.body;
	const foundSeller = await Seller.validateSeller(email, password)
	if(foundSeller){
		req.session.seller_id = foundSeller._id
		res.redirect('/sellerhome')
	}
	else{
		res.redirect('/sellerlogin')
	}
})

app.post('/sellerlogout', (req, res) => {
	req.session.destroy()
	res.redirect('/sellerlogin')
})

app.get('/sellerhome', sellerLogin, async(req, res) => {
	const seller_id = req.session.seller_id
	const seller = await Seller.findOne({ _id: seller_id })
	const username = seller.username
	res.render('sellerhome', { username })
})

app.get('/listitem', sellerLogin, (req, res) => {
	res.render('listitem')
})

app.post('/listitem', sellerLogin, (req, res) => {
	res.send(req.body)
})

app.get('*', (req, res) => {
	res.render('undefined')
})

const port = 3001;
app.listen(port, () => {
	console.log(`Server running on Port ${port}`)
})
