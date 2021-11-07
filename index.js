const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const flash = require("connect-flash")
const session = require('express-session');
const path = require('path');
const port = process.env.PORT || 3000

// Models
const Buyer = require('./models/buyer')
const Seller = require('./models/seller')
const Product = require('./models/product')

// Routes
const mainRoutes = require("./routes/main")
const buyerRoutes = require("./routes/buyer")
const sellerRoutes = require("./routes/seller")
const adminRoutes = require("./routes/admin")

var Publishable_Key = 'pk_test_51JrkwZSGTTdwKf5g4xzsgRumwqOEvzQd0zlLDzT5JvcJtuEhx7XEEdVZElAXYmIhTsK37fvdP8KHHUcVEOFgx7Eu00rE7oFu1Q'
var Secret_Key = 'sk_test_51JrkwZSGTTdwKf5gbqJzAxZV1YQtFlFSjfB2kFd2URZM7n9AmRkyiwBUnnKQ1tGxh6AS2CAG609jK8SWJg1oNHmh00BfVoMlLZ'

const stripe = require('stripe')(Secret_Key)

mongoose.connect('mongodb://localhost:27017/shophop', { useNewUrlParser: true })
	.then(()=>{
		console.log("Connected to database")
	})
	.catch((err)=>{
		console.log("Error")
		console.log(err)
	})

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'))

app.use(flash());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'thisaverygoodsecret'} ))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended:true }))

app.use("/", mainRoutes);
app.use("/buyer", buyerRoutes);
app.use("/seller", sellerRoutes);

app.get('*', (req, res) => {
	res.render('undefined')
})

app.listen(port, () => {
	console.log(`Server running on Port ${port}`)
})
