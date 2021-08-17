const express = require("express");
const router = express.Router();

const User = require("../models/user");

// package for password hashing before storing in the database
const bcrypt = require("bcryptjs");

// package to generate an access token for the user on login
const jwt = require("jsonwebtoken");

router.get("/", (req, res) => {
	User.find()
		.populate("address")
		.select("-passwordHash")
		.then((userList) => {
			res.status(200).json({ success: true, userList });
		})
		.catch((err) => {
			res.status(500).json({ success: false, error: err });
		});
});

router.get("/:id", (req, res) => {
	User.findById(req.params.id)
		.populate("address")
		.select("-passwordHash")
		.then((user) => {
			if (!user) {
				return res.status(404).json({ success: false, message: "User with the given id was not found!" });
			}
			return res.status(200).json({ success: true, user });
		})
		.catch((err) => {
			return res.status(400).json({ success: false, error: err });
		});
});

router.post("/register", (req, res) => {
	const { name, email, password, phone } = req.body;
	const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(parseInt(process.env.HASH_SALT)));

	let { isAdmin } = req.body;
	isAdmin ??= false;

	let user = new User({
		name,
		email,
		passwordHash,
		phone,
		isAdmin,
	});

	user.save()
		.then((user) => {
			res.json({ success: true, user });
		})
		.catch((err) => {
			res.status(500).json({ success: false, err });
		});
});

router.put("/:id", (req, res) => {
	const { name, email, passwordHash, phone, isAdmin } = req.body;
	User.findByIdAndUpdate(
		req.params.id,
		{
			name,
			email,
			passwordHash,
			phone,
			isAdmin,
		},
		{
			new: true,
		}
	)
		.then((user) => {
			if (!user) {
				return res.status(404).json({ success: false, message: "User with the given id was not found!" });
			}
			return res.status(200).json({ success: true, user });
		})
		.catch((err) => {
			return res.status(400).json({ success: false, error: err });
		});
});

router.delete("/:id", (req, res) => {
	User.findByIdAndRemove(req.params.id)
		.then((user) => {
			if (!user) {
				return res.status(404).json({ success: false, message: "Requested user was not found!" });
			}
			return res.status(200).json({ success: true, message: "User has been deleted!" });
		})
		.catch((err) => {
			return res.status(400).json({ success: false, error: err });
		});
});

router.post("/login", (req, res) => {
	const { email, password } = req.body;

	User.findOne({ email })
		.then((user) => {
			if (!user) return res.status(400).json({ success: false, message: "This email doesn't exist!" });
			if (!bcrypt.compareSync(password, user.passwordHash)) {
				return res
					.status(400)
					.json({ success: false, message: "Authentication failed, password is incorrect!" });
			} else {
				const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
					expiresIn: "1d",
				});
				res.status(200).json({ success: true, userEmail: user.email, userId: user._id, token });
			}
		})
		.catch((err) => {
			// console.log(err);
			res.status(400).json({ success: false, message: err });
		});
});

router.get("/:id/cart", (req, res) => {
	User.findById(req.params.id)
		.populate("cart.product")
		.select("cart")
		.then((user) => {
			if (!user) {
				return res.status(404).json({ success: false, message: "User with the given id was not found!" });
			}
			return res.status(200).json({ success: true, user });
		})
		.catch((err) => {
			return res.status(400).json({ success: false, error: err });
		});
});

router.get("/:id/wishlist", (req, res) => {
	User.findById(req.params.id)
		.populate("wishlist.product")
		.select("wishlist")
		.then((user) => {
			if (!user) {
				return res.status(404).json({ success: false, message: "User with the given id was not found!" });
			}
			return res.status(200).json({ success: true, user });
		})
		.catch((err) => {
			return res.status(400).json({ success: false, error: err });
		});
});

router.post("/:id/cart", (req, res) => {
	const { product } = req.body;
	User.findById(req.params.id)
		.then((user) => {
			if (!user) {
				return res.status(404).json({ success: false, message: "User with the given id was not found!" });
			}

			let isNewProduct = user.cart.every((cartItem) => {
				return cartItem.product != product;
			});

			if (!isNewProduct) return res.status(400).json({ success: false, message: "Product is already in cart!" });
			user.cart.push({ product });
			user.save()
				.then((user) => {
					return res.status(200).json({ success: true, user });
				})
				.catch((err) => {
					return res.status(400).json({ success: false, error: err });
				});
		})
		.catch((err) => {
			return res.status(400).json({ success: false, error: err });
		});
});

router.post("/:id/wishlist", (req, res) => {
	const { product } = req.body;
	User.findById(req.params.id)
		.then((user) => {
			if (!user) {
				return res.status(404).json({ success: false, message: "User with the given id was not found!" });
			}

			let isNewProduct = user.wishlist.every((wishlistItem) => {
				return wishlistItem.product != product;
			});

			if (!isNewProduct)
				return res.status(400).json({ success: false, message: "Product is already in wishlist!" });
			user.wishlist.push({ product });
			user.save()
				.then((user) => {
					return res.status(200).json({ success: true, user });
				})
				.catch((err) => {
					return res.status(400).json({ success: false, error: err });
				});
		})
		.catch((err) => {
			return res.status(400).json({ success: false, error: err });
		});
});

router.post("/:userId/cart/:productId", (req, res) => {
	const { count } = req.body;
	User.findById(req.params.userId)
		.then((user) => {
			if (!user) {
				return res.status(404).json({ success: false, message: "User with the given id was not found!" });
			}

			let productIndex = user.cart.findIndex((cartItem) => {
				return cartItem.product._id == req.params.productId;
			});

			if (productIndex == -1) return res.status(400).json({ success: false, message: "Product not found!" });
			user.cart[productIndex].quantity += Number(count);
			if (user.cart[productIndex].quantity <= 0)
				return res.status(400).json({ success: false, message: "Product quantity cannot be 0!" });
			user.save()
				.then((user) => {
					return res.status(200).json({ success: true, user });
				})
				.catch((err) => {
					return res.status(400).json({ success: false, error: err });
				});
		})
		.catch((err) => {
			return res.status(400).json({ success: false, error: err });
		});
});

module.exports = router;
