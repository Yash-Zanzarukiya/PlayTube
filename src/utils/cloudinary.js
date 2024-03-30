import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //Uploading File to Cloudinary
    const cldnry_res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // File Uploaded Successfully
    // console.log("File Uploaded Successfully");

    //Removing File From Local System
    fs.unlinkSync(localFilePath);

    return cldnry_res;
  } catch (error) {
    fs.unlinkSync(localFilePath); //Removing File From Local System
    console.log("CLOUDINARY :: FILE UPLOAD ERROR ", error);
    return null;
  }
};

export { uploadOnCloudinary };
