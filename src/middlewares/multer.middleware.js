import multer from "multer";
import fs from "fs";

const localTempPath = "../../public/";

const storage = multer.diskStorage({
  // destination: function (req, file, cb) {
  //   console.log("file: ", file);
  //   console.log("LocalPath: ", localTempPath);

  //   if (!fs.existsSync(localTempPath))
  //     console.log(`Directory ${localTempPath} still does not exist.`);
  //   else
  //     console.log(`Directory ${localTempPath} exist.`);

  //   cb(null, localTempPath);
  // },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
    console.log("file.originalname: ", file.originalname);
  },
});

export const upload = multer({
  storage,
});
