const express = require("express");
const mongoose = require("mongoose");
const userrouter = require("./routes/letsfix-routes");
const app = express();
const formatBufferTo64 = require("./utils/FormatBuffer");
const multer = require("multer");
const cloudinary = require("cloudinary");
app.use(express.json());
//Middlewares

app.use("/user", userrouter);

const ALLOWED_FORMATS = ["image/jpeg", "image/png", "image/jpg"];

cloudinary.config({
  cloud_name: "dx2o0mzrb",
  api_key: "854897518731972",
  api_secret: "8F5-tIFb8CuC9yEXp1UxAgltwSE",
});

let fileTypeCheck = false;
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    if (ALLOWED_FORMATS.includes(file.mimetype)) {
      cb(null, true); //Specifing the type of memory storage. Images will be stored in memory only for a period of time while serving the request.
    } else {
      fileTypeCheck = true;
      cb(new Error("Not Supported File Type"), false);
    }
  },
});

const singleUpload = upload.array("picture");
const singleUploadCtrl = (req, resp, next) => {
  singleUpload(req, resp, (error) => {
    if (error) {
      return resp.status(422).json({
        success: false,
        message: fileTypeCheck
          ? "Upload only jpg, jpeg, png files"
          : "Image Upload Failed",
        error: error,
      });
    }
    next();
  });
};
app.post("/upload", singleUploadCtrl, async (req, resp) => {
  try {
    for (let i = 0; i < req.files.length; i++) {
      const file64 = formatBufferTo64(req.files[i]);
      picturePath = await cloudinary.v2.uploader.upload(file64.content, {
        folder: "proposalImages",
      });
    }

    resp.status(200).json({
      success: true,
      message: "Image Uploaded Successfully",
    });
  } catch (error) {
    console.log(error);
  }
});
mongoose
  .connect(
    "mongodb+srv://admin:kRiMYVnvpok7RFod@cluster0.bmbsgbv.mongodb.net/letsfix?retryWrites=true&w=majority"
  )
  .then(() => console.log("connected to database"))
  .then(() => app.listen(5000))
  .catch((err) => console.log(err));
//kRiMYVnvpok7RFod

// api key cloudinary - 854897518731972
