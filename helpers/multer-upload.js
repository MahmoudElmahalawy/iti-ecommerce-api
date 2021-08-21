const multer = require("multer");
const fs = require("fs-extra");

const VALID_FILE_TYPE_MAP = {
	"image/png": "png",
	"image/jpg": "jpg",
	"image/jpeg": "jpeg",
};

const multerUpload = multer({
	storage: multer.diskStorage({
		destination: (req, file, callback) => {
			const path = `public/images/categories/${req.body.category}/`;
			const isValidType = VALID_FILE_TYPE_MAP[file.mimetype];
			let uploadError = new Error("Invalid image type!");

			if (isValidType) {
				uploadError = null;
				fs.mkdirsSync(path);
			}
			callback(uploadError, path);
		},
		filename: (req, file, callback) => {
			//originalname is the uploaded file's name with extension
			const fileName = file.originalname.replace(/[ ,.]/g, "-");
			const fileExtension = VALID_FILE_TYPE_MAP[file.mimetype];

			callback(null, `${fileName}-${Date.now()}.${fileExtension}`);
		},
	}),
});

module.exports = { multerUpload };
