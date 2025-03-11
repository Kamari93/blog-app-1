const express = require("express"); // for backend server
const mongoose = require("mongoose"); // for database
const cors = require("cors"); // for cross-origin resource sharing...access the api to the front-end
const bcrypt = require("bcrypt"); // for password hashing
const jwt = require("jsonwebtoken"); // used for authentication
const cookieParser = require("cookie-parser"); // used for authentication
const multer = require("multer"); // for file upload
const path = require("path"); // for file upload
const UserModel = require("./models/UserModel");
const PostModel = require("./models/PostModel");
require("dotenv").config(); // Load .env variables

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

// Middleware
app.use(
  cors({
    origin: "https://blog-app-1-client.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());
app.use(express.static("Public")); // for serving static files...gives us access to the public folder in all our routes

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL);

const updateOldPosts = async () => {
  try {
    // Find posts missing createdAt
    const postsWithoutCreatedAt = await PostModel.find({
      createdAt: { $exists: false },
    });

    for (const post of postsWithoutCreatedAt) {
      // post.createdAt = post.updatedAt ? new Date(post.updatedAt) : new Date(); // Use updatedAt if available, otherwise use now
      // await post.save(); // Save each document
      post.set(
        "createdAt",
        post.updatedAt ? new Date(post.updatedAt) : new Date()
      );
      await post.save({ validateBeforeSave: false }); // Avoid validation issues
    }

    // await PostModel.updateMany(
    //       { email: "brucelee1@gmail.com", username: { $exists: false } },
    //       { $set: { username: "Bruce Lee" } }
    //     );

    //     await PostModel.updateMany(
    //       { email: "jblake123@gmail.com", username: { $exists: false } },
    //       { $set: { username: "James Blake" } }
    //     );

    console.log("Old posts updated successfully.");
  } catch (error) {
    console.error("Error updating old posts:", error);
  }
};

// Run the update function once the database is connected
// mongoose.connection.once("open", () => {
//   console.log("Connected to MongoDB");

//   // Call the update function when the server starts
//   updateOldPosts();
// });

//middleware
const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    res.json("Token is missing, please login");
  } else {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.json("The token is not valid");
      } else {
        req.email = decoded.email;
        req.username = decoded.username;
        next();
      }
    });
  }
};

// Routes/APIs
app.get("/", verifyUser, (req, res) => {
  return res.json({ email: req.email, username: req.username });
});

app.post("/register", (req, res) => {
  // hash pw
  const { username, email, password } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => {
      UserModel.create({ username, email, password: hash })
        .then((user) => res.json(user))
        .catch((err) => res.json(err));
    })
    .catch((err) => console.log(err));
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  UserModel.findOne({ email: email }).then((user) => {
    if (user) {
      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          // create token if password is correct
          const token = jwt.sign(
            { email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
          );
          // store cookie with name "token"
          // res.cookie("token", token);
          res.cookie("token", token, {
            httpOnly: true,
            secure: true, // This makes the cookie only work on HTTPS
            sameSite: "None", // Allows cross-origin cookies
          });
          // return res.json("Login successful");
          return res.json({
            message: "Login successful",
            username: user.username,
            email: user.email,
          });
        } else {
          res.json("Password is incorrect");
        }
      });
    } else {
      res.json("User not found");
    }
  });
});

// storage file
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "blog_app1_images", // Folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png"], // Allow only image formats
    transformation: [{ width: 500, height: 500, crop: "limit" }], // Optional resize
    public_id: (req, file) => Date.now() + "-" + file.originalname, // Unique filename
  },
});

const upload = multer({ storage: storage });

app.post("/create", verifyUser, upload.single("file"), async (req, res) => {
  try {
    // const fileUrl = req.file ? req.file.path : ""; // If file is optional, return empty string if no file
    const fileUrl = req.file ? req.file.path || req.file.url : ""; // If file is optional, return empty string if no file
    await PostModel.create({
      title: req.body.title,
      description: req.body.description,
      file: fileUrl,
      email: req.body.email,
      username: req.username, // Store the username from verifyUser middleware
    });
    res.json("Post created successfully");
  } catch (err) {
    console.log("Server Error:", err);
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
  // console.log("Uploaded File:", req.file);
});

app.put(
  "/editpost/:id",
  verifyUser,
  upload.single("file"),
  async (req, res) => {
    try {
      const postId = req.params.id;
      const existingPost = await PostModel.findById(postId);

      if (!existingPost) {
        return res.status(404).json({ message: "Post not found" });
      }

      let newFileUrl = existingPost.file; // Retains old image (if any), otherwise remains undefined/null

      if (req.file) {
        newFileUrl = req.file.path || req.file.url; // Assigns new image if uploaded

        // Only delete the old Cloudinary image if it exists
        if (
          existingPost.file &&
          existingPost.file.includes("res.cloudinary.com")
        ) {
          const urlParts = existingPost.file.split("/");
          const filenameWithExtension = urlParts[urlParts.length - 1];
          const filename = filenameWithExtension
            .split(".")
            .slice(0, -1)
            .join(".");
          const publicId = `blog_app1_images/${filename}`;

          console.log("Deleting old image from Cloudinary:", publicId);
          await cloudinary.uploader.destroy(publicId);
        }
      }

      // Updates the post, keeping the old image if no new file is uploaded
      const updatedPost = await PostModel.findByIdAndUpdate(
        postId,
        {
          title: req.body.title,
          description: req.body.description,
          file: newFileUrl, // This could be unchanged, updated, or set to undefined/null
        },
        { new: true }
      );

      res.json({ message: "Post updated successfully", post: updatedPost });
    } catch (err) {
      console.error("Error updating post:", err);
      res
        .status(500)
        .json({ message: "Something went wrong", error: err.message });
    }
  }
);

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json("Logout successful");
});

app.get("/getposts", async (req, res) => {
  try {
    const posts = await PostModel.find()
      .sort({ createdAt: -1 })
      .select("title description file email username createdAt"); // Include username

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json("Something went wrong");
  }
});

app.get("/getpostbyid/:id", (req, res) => {
  const id = req.params.id;
  PostModel.findById({ _id: id })
    .then((post) => {
      res.json(post);
    })
    .catch((err) => {
      console.log(err);
    });
});

// auto delete images from cloudinary when post is deleted
app.delete("/deletepost/:id", async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (post && post.file) {
      // Extract publicId from Cloudinary URL
      const urlParts = post.file.split("/");
      const filenameWithExtension = urlParts[urlParts.length - 1]; // e.g., "1741309410122-flow.png.png"
      const filename = filenameWithExtension.split(".").slice(0, -1).join("."); // Remove extension
      const publicId = `blog_app1_images/${filename}`; // Ensure it matches how Cloudinary saves it

      console.log("Deleting Image with Public ID:", publicId);
      await cloudinary.uploader.destroy(publicId);
    }

    await PostModel.findByIdAndDelete(req.params.id);
    res.json("Post deleted successfully");
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json("Something went wrong");
  }
});

// start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
