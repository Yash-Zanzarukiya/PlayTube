import multer from "multer";

const localTempPath = "./public/temp";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, localTempPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage,
});
