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
app.use(express.json());
app.use(
  cors({
    origin: "https://blog-app-1-client.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.static("Public")); // for serving static files...gives us access to the public folder in all our routes

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL);

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
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "Public/Images");
//   },
//   filename: (req, file, cb) => {
//     cb(
//       null,
//       file.fieldname + "_" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });

// const upload = multer({
//   storage: storage, // storage file
// });

// storage file
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "blog_app1_images", // Folder name in Cloudinary
    format: async (req, file) => "jpg", // Set file format
    public_id: (req, file) => Date.now() + "-" + file.originalname, // Unique filename
  },
});
const upload = multer({ storage: storage });

// app.post("/create", verifyUser, upload.single("file"), (req, res) => {
//   //   console.log(req.file);
//   PostModel.create({
//     title: req.body.title,
//     description: req.body.description,
//     file: req.file.filename,
//     email: req.body.email,
//   })
//     .then((result) => {
//       res.json("Post created successfully");
//     })
//     .catch((err) => res.json(err));
// });

app.post("/create", verifyUser, upload.single("file"), async (req, res) => {
  try {
    const fileUrl = req.file ? req.file.path : ""; // If file is optional, return empty string if no file
    await PostModel.create({
      title: req.body.title,
      description: req.body.description,
      file: fileUrl,
      email: req.body.email,
    });
    res.json("Post created successfully");
  } catch (err) {
    console.log("Server Error:", err);
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
});

app.put("/editpost/:id", (req, res) => {
  const id = req.params.id;
  PostModel.findByIdAndUpdate(
    { _id: id },
    { title: req.body.title, description: req.body.description }
  )
    .then((result) => {
      res.json("Post updated successfully");
    })
    .catch((err) => {
      res.json(err);
    });
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json("Logout successful");
});

app.get("/getposts", (req, res) => {
  PostModel.find()
    .then((posts) => {
      res.json(posts);
    })
    .catch((err) => {
      res.json(err);
    });
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

app.delete("/deletepost/:id", (req, res) => {
  const id = req.params.id;
  PostModel.findByIdAndDelete({ _id: id })
    .then((result) => {
      res.json("Post deleted successfully");
    })
    .catch((err) => {
      res.json(err);
    });
});

// start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
