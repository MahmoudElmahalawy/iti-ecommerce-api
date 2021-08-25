const express = require("express");
const router = express.Router();

const Category = require("../models/category");

router.get("/", (req, res) => {
	Category.find()
		.then((categoryList) => {
			res.status(200).json({ success: true, categoryList });
		})
		.catch((err) => {
			res.status(500).json({ success: false, error: err });
		});
});

router.get("/:id", (req, res) => {
	Category.findById(req.params.id)
		.then((category) => {
			if (!category) {
				return res.status(404).json({ success: false, message: "Category with the given id was not found!" });
			}
			return res.status(200).json({ success: true, category });
		})
		.catch((err) => {
			return res.status(400).json({ success: false, error: err });
		});
});

router.post("/", (req, res) => {
	const { name, image, title, description } = req.body;

	let category = new Category({
		name,
		image,
		title,
		description,
	});

	category
		.save()
		.then((category) => {
			res.send(category);
		})
		.catch((err) => {
			res.status(500).send(err);
		});
});

router.put("/:id", (req, res) => {
	const { name } = req.body;
	Category.findByIdAndUpdate(
		req.params.id,
		{
			name,
		},
		{
			new: true,
		}
	)
		.then((category) => {
			if (!category) {
				return res.status(404).json({ success: false, message: "Category with the given id was not found!" });
			}
			return res.status(200).json({ success: true, category });
		})
		.catch((err) => {
			return res.status(400).json({ success: false, error: err });
		});
});

router.delete("/:id", (req, res) => {
	Category.findByIdAndRemove(req.params.id)
		.then((category) => {
			if (!category) {
				return res.status(404).json({ success: false, message: "Requested category was not found!" });
			}
			return res.status(200).json({ success: true, message: "Category has been deleted!" });
		})
		.catch((err) => {
			return res.status(400).json({ success: false, error: err });
		});
});

module.exports = router;
