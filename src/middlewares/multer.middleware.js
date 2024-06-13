import multer from "multer";
import fs from "fs";

const localTempPath = "../../public/temp";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("file: ", file);
    console.log("LocalPath: ", localTempPath);
    if (!fs.existsSync(localTempPath)) {
      console.error(`Directory ${localTempPath} does not exist.`);
      // fs.mkdirSync(localTempPath, { recursive: true });
    }
    cb(null, localTempPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
    console.log("file.originalname: ", file.originalname);
  },
});

export const upload = multer({
  storage,
});
