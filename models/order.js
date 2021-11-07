const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
	item_id: String,
	seller_id: String,
	item_price: Number,
	status: String,
	order_date: {
		type:	Date,
		default: Date.now
	},
	delivery_date: {
		type:	Date
	}
})

module.exports = mongoose.model('Order', orderSchema);
