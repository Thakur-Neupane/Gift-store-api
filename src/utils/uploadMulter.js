import multer from "multer";

const imgFolderPath = "public/img/product";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let error = null;
    cb(error, imgFolderPath);
  },
  filename: function (req, file, cb) {
    let error = "";

    // make a unique filename

    const fullFileName = Date.now() + "-" + file.originalname;

    cb(error, fullFileName);
  },
});

const limits = {
  fileSize: 10 * 1024 * 1024,
};

const fileFilter = (req, res, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only images are allowed."), false);
  }
  cb(null, true);
};

const multerUpload = multer({ storage, limits, fileFilter });

export default multerUpload;
