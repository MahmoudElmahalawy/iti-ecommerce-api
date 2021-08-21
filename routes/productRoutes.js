const express = require("express");
const router = express.Router();

const { multerUpload } = require("../helpers/multer-upload");

const Product = require("../models/product");
const Category = require("../models/category");

router.get("/", (req, res) => {
	// to get specific category products
	if (req.query.category) {
		var categoryFilter = { category: req.query.category.split(",") };
	}
	Product.find(categoryFilter)
		.populate("category")
		.then((productList) => {
			res.status(200).json({ success: true, productList });
		})
		.catch((err) => {
			res.status(500).json({ success: false, error: err });
		});
});

router.get("/:id", (req, res) => {
	// to get only name and shortDescription fields
	// Product.findById(req.params.id).select("-_id name shortDescription")

	// to validate id using mongoose
	// mongoose.isValidObjectId(req.params.id)
	Product.findById(req.params.id)
		.populate("category")
		.then((product) => {
			if (!product) {
				return res.status(404).json({ success: false, message: "Product with the given id was not found!" });
			}
			return res.status(200).json({ success: true, product });
		})
		.catch((err) => {
			return res.status(400).json({ success: false, error: err });
		});
});

router.post("/", multerUpload.single("images"), (req, res) => {
	Category.findById(req.body.category).then((category) => {
		if (!category) {
			return res.status(400).json({ success: false, message: "Invalid category" });
		}
	});

	const fileName = req.file.filename;
	const basePath = `${req.protocol}://${req.get("host")}/images/categories/${req.body.category}/`;

	const { name, shortDescription, description, brand, price, category, countInStock, rating, reviews, isFeatured } =
		req.body;

	let product = new Product({
		name,
		shortDescription,
		description,
		images: `${basePath}${fileName}`,
		brand,
		price,
		category,
		countInStock,
		rating,
		reviews,
		isFeatured,
	});

	product
		.save()
		.then((product) => {
			if (!product) {
				return res.status(500).json({ success: false, message: "The product cannot be created" });
			}
			return res.status(200).json({ success: true, product });
		})
		.catch((err) => {
			return res.status(400).json({ success: false, message: err });
		});
});

router.put("/:id", (req, res) => {
	Category.findById(req.body.category).then((category) => {
		if (!category) {
			return res.status(400).json({ success: false, message: "Invalid category" });
		}
	});

	const {
		name,
		shortDescription,
		description,
		images,
		brand,
		price,
		category,
		countInStock,
		rating,
		reviews,
		isFeatured,
	} = req.body;

	Product.findByIdAndUpdate(
		req.params.id,
		{
			name,
			shortDescription,
			description,
			images,
			brand,
			price,
			category,
			countInStock,
			rating,
			reviews,
			isFeatured,
		},
		{
			new: true,
		}
	)
		.then((product) => {
			if (!product) {
				return res.status(404).json({ success: false, message: "Product with the given id was not found!" });
			}
			return res.status(200).json({ success: true, product });
		})
		.catch((err) => {
			return res.status(400).json({ success: false, error: err });
		});
});

router.delete("/:id", (req, res) => {
	Product.findByIdAndRemove(req.params.id)
		.then((product) => {
			if (!product) {
				return res.status(404).json({ success: false, message: "Requested product was not found!" });
			}
			return res.status(200).json({ success: true, message: "Product has been deleted!" });
		})
		.catch((err) => {
			return res.status(400).json({ success: false, error: err });
		});
});

// get all product count
router.get("/get/count", (req, res) => {
	Product.countDocuments()
		.then((count) => {
			if (!count) {
				return res.status(400).json({ success: false, message: "Couldn't get product count!" });
			}
			return res.status(200).json({ success: true, productCount: count });
		})
		.catch((err) => {
			return res.status(400).json({ success: false, error: err });
		});
});

// get featured products
router.get("/get/featured", (req, res) => {
	const count = req.query.count ? req.query.count : 0;
	Product.find({ isFeatured: true })
		.limit(+count)
		.then((featuredProducts) => {
			if (!featuredProducts) {
				return res.status(400).json({ success: false, message: "Couldn't get featured products!" });
			}
			return res.status(200).json({ success: true, featuredProducts });
		})
		.catch((err) => {
			return res.status(400).json({ success: false, error: err });
		});
});

module.exports = router;
