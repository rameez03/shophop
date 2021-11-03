const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
	title: {
		type: String,
		required: [true, 'Title cannot be blank!']
	},
	description: {
		type: String,
		required: [true, 'Description cannot be blank!']
	},
	price: Number,
	category: String,
	images: {
		type: [String],
	},
	soldby: {
		id: {
		 type: mongoose.Schema.Types.ObjectId,
		 ref: "Seller"
		},
		username: String
	}
})

module.exports = mongoose.model('Product', productSchema);
