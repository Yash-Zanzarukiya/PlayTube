import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadPhotoOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //Uploading File to Cloudinary
    const cldnry_res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "videotube/photos",
    });

    // File Uploaded Successfully & Removing File From Local System
    fs.unlinkSync(localFilePath);
    return cldnry_res;
  } catch (error) {
    fs.unlinkSync(localFilePath); //Removing File From Local System
    console.log("CLOUDINARY :: FILE UPLOAD ERROR ", error);
    return null;
  }
};

const uploadVideoOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //Uploading File to Cloudinary
    const cldnry_res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "video",
      folder: "videotube/videos",
    });

    // File Uploaded Successfully & Removing File From Local System
    fs.unlinkSync(localFilePath);

    return cldnry_res;
  } catch (error) {
    fs.unlinkSync(localFilePath); //Removing File From Local System
    console.log("CLOUDINARY :: FILE UPLOAD ERROR ", error);
    return null;
  }
};

const deleteImageOnCloudinary = async (ImageId) => {
  try {
    if (!ImageId) return false;

    const cldnry_res = await cloudinary.uploader.destroy(ImageId, {
      resource_type: "image",
    });

    return cldnry_res;
  } catch (error) {
    console.log("CLOUDINARY :: FILE Delete ERROR ", error);
    return false;
  }
};

const deleteVideoOnCloudinary = async (VideoId) => {
  try {
    if (!VideoId) return false;

    const cldnry_res = await cloudinary.uploader.destroy(VideoId, {
      resource_type: "video",
    });

    return cldnry_res;
  } catch (error) {
    console.log("CLOUDINARY :: FILE Delete ERROR ", error);
    return false;
  }
};

export {
  uploadPhotoOnCloudinary,
  uploadVideoOnCloudinary,
  deleteImageOnCloudinary,
  deleteVideoOnCloudinary,
};
