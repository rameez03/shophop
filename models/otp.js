const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const otpSchema = new mongoose.Schema({
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
otpSchema.statics.validateOtp = async function (email, otpemail) { 
	const otp = await this.findOne({ email});
	const isValid = await bcrypt.compare(otpemail, otp.otpemail); 
	return isValid ? otp: false;
}
otpSchema.pre('save', async function (next) {
	if(!this.isModified('otpemail')) return next();
	this.otpemail= await bcrypt.hash(this.otpemail, 12);
	next();
})
module.exports = mongoose.model('Otp', otpSchema);