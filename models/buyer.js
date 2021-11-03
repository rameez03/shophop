const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const buyerSchema = new mongoose.Schema({
	email: {
		type: String,
		required: [true, 'Email cannot be blank!']
	},
	username: {
		type: String,
		required: [true, 'Username cannot be blank!']
	},
	password: {
		type: String,
		required: [true, 'Password cannot be blank!']
	},
	cart_items: [mongoose.Schema.Types.ObjectId],
	ordered_items: [mongoose.Schema.Types.ObjectId]
})

buyerSchema.statics.validateBuyer = async function (email, password) { 
	const buyer = await this.findOne({ email });
	const isValid = await bcrypt.compare(password, buyer.password); 
	return isValid ? buyer: false;
}

buyerSchema.pre('save', async function (next) {
	if(!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 12);
	next();
})


module.exports = mongoose.model('Buyer', buyerSchema);
