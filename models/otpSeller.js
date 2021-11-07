const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const otpSellerSchema = new mongoose.Schema({
	//id:[mongoose.Schema.Types.ObjectId],
	email:{
		type:String,
		unique:true
	},
	otpemail:{
		type: String
	},
    time:{
        type:Number,
        default:Date.now()
    }
})
otpSellerSchema.statics.validateOtpSeller = async function (email, otpemail) { 
	const otpSeller = await this.findOne({ email});
	const isValid = await bcrypt.compare(otpemail, otpSeller.otpemail); 
	return isValid ? otpSeller: false;
}
otpSellerSchema.pre('save', async function (next) {
	if(!this.isModified('otpemail')) return next();
	this.otpemail= await bcrypt.hash(this.otpemail, 12);
	next();
})
module.exports = mongoose.model('OtpSeller', otpSellerSchema);