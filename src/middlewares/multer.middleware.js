import multer from "multer";

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
    console.log("file.originalname: ", file.originalname);
  },
});

export const upload = multer({
  storage,
});
