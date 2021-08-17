const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	passwordHash: {
		type: String,
		required: true,
	},
	phone: {
		type: String,
		required: true,
	},
	isAdmin: {
		type: Boolean,
		default: false,
	},
	address: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Address",
		},
	],
	cart: [
		{
			product: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Product",
			},
			quantity: {
				type: Number,
				default: 1,
				min: 1,
			},
		},
	],
	wishlist: [
		{
			product: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Product",
			},
		},
	],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
