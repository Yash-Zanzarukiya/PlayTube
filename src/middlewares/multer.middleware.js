import multer from "multer";

const localTempPath = "public/temp";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("LocalPath: ", localTempPath);
    cb(null, localTempPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
    req.on("close", () => {
      console.log("Multer request aborted...");
    });
  },
});

export const upload = multer({
  storage,
});
