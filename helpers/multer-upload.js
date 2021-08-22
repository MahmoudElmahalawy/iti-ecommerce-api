const multer = require("multer");
const fs = require("fs-extra");

const VALID_FILE_TYPE_MAP = {
	"image/png": "png",
	"image/jpg": "jpg",
	"image/jpeg": "jpeg",
};

const multerUpload = multer({
	limits: { fileSize: 1 * 1024 * 1024 },
	fileFilter: (req, file, callback) => {
		const isValidType = VALID_FILE_TYPE_MAP[file.mimetype];

		if (!isValidType) {
			const err = new Error("Only .png, .jpg and .jpeg format allowed!");
			err.name = "FileExtensionError";
			callback(err, false);
		} else {
			callback(null, true);
		}
	},
	storage: multer.diskStorage({
		destination: (req, file, callback) => {
			const path = `public/images/categories/${req.body.category}/`;

			fs.mkdirsSync(path);
			callback(null, path);
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
