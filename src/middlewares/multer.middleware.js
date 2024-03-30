// import multer from "multer";

// // let localStoragePath = "./public/temp/";

// const storage = multer.diskStorage({
//   destination: function (req, file, callback) {
//     callback(null, "./public/temp");
//   },
//   filename: function (req, file, callback) {
//     callback(null, file.originalname);
//   },
// });

// export const upload = multer({ storage });

import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage,
});
