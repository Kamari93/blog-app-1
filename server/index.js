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
const CommentModel = require("./models/CommentModel");
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

const updatePostsLikes = async () => {
  try {
    await PostModel.updateMany(
      { likes: { $exists: false } }, // Find posts where likes is missing
      { $set: { likes: [] } } // Set likes to an empty array
    );
    console.log("All existing posts updated with likes: []");
    mongoose.disconnect();
  } catch (error) {
    console.error("Error updating posts:", error);
    mongoose.disconnect();
  }
};

// updatePostsLikes();

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
    return res.json("Token is missing, please login");
  } else {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.json("The token is not valid");
      } else {
        req.email = decoded.email;
        req.username = decoded.username;
        req._id = decoded._id;
        next();
      }
    });
  }
};

// Routes/APIs
app.get("/", verifyUser, (req, res) => {
  return res.json({ email: req.email, username: req.username, _id: req._id });
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
            { email: user.email, username: user.username, _id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );
          // store cookie with name "token"
          // res.cookie("token", token);
          res.cookie("token", token, {
            httpOnly: true,
            secure: true, // This makes the cookie only work on HTTPS
            sameSite: "None", // Allows cross-origin cookies
            maxAge: 10 * 60 * 1000, // 10 minutes in milliseconds
            // maxAge: 60 * 60 * 1000 // 1 hour in milliseconds
          });
          // return res.json("Login successful");
          return res.json({
            message: "Login successful",
            username: user.username,
            email: user.email,
            _id: user._id,
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

// app.get("/logout", (req, res) => {
//   res.clearCookie("token");
//   return res.json("Logout successful");
// });

app.get("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    expires: new Date(0), // Expire the cookie immediately
  });
  return res.json("Logout successful");
});

app.get("/getposts", async (req, res) => {
  try {
    const posts = await PostModel.find()
      .sort({ createdAt: -1 })
      .select("title description file email username createdAt likes"); // Include username

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

    // 🧹 Delete all comments related to this post
    await CommentModel.deleteMany({ post: req.params.id });

    await PostModel.findByIdAndDelete(req.params.id);
    res.json("Post deleted successfully");
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json("Something went wrong");
  }
});

// like/unlike post functionality
// app.put("/togglelike/:postId", async (req, res) => {
//   try {
//     const { userId } = req.body;
//     const { postId } = req.params;

//     const post = await PostModel.findById(postId);
//     if (!post) return res.status(404).json({ message: "Post not found" });

//     const index = post.likes.indexOf(userId);
//     if (index === -1) {
//       post.likes.push(userId); // Like the post
//     } else {
//       post.likes.splice(index, 1); // Unlike the post
//     }

//     await post.save();
//     res.json({ likes: post.likes.length });
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// app.put("/togglelike/:postId", async (req, res) => {
//   const { userId } = req.body;
//   try {
//     const post = await PostModel.findById(req.params.postId);
//     if (!post) return res.status(404).json({ message: "Post not found" });

//     // Ensure likes array exists
//     if (!post.likes) post.likes = [];

//     const likedIndex = post.likes.indexOf(userId);
//     if (likedIndex === -1) {
//       post.likes.push(userId); // Add like
//     } else {
//       post.likes.splice(likedIndex, 1); // Remove like (Unlike)
//     }

//     await post.save();
//     res.json({ likes: post.likes });
//   } catch (error) {
//     res.status(500).json({ message: "Error toggling like", error });
//   }
// });

app.put("/togglelike/:postId", async (req, res) => {
  try {
    const { _id } = req.body;
    const post = await PostModel.findById(req.params.postId);

    if (!post) return res.status(404).json({ message: "Post not found" });

    // Ensure likes is an array
    if (!Array.isArray(post.likes)) post.likes = [];

    // Toggle like
    if (post.likes.includes(_id)) {
      post.likes = post.likes.filter((id) => id.toString() !== _id);
    } else {
      post.likes.push(_id);
    }

    await post.save();
    res.json({ likes: post.likes });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// comment functionality

// app.post("/addcomment", verifyUser, async (req, res) => {
//   try {
//     const { text, postId } = req.body;
//     const newComment = await CommentModel.create({
//       text,
//       user: req.email, // Using the email from the verified user
//       post: postId,
//     });

//     // Add comment to post's comments array
//     await PostModel.findByIdAndUpdate(postId, {
//       $push: { comments: newComment._id },
//     });

//     res.json({ message: "Comment added", comment: newComment });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.post("/addcomment", async (req, res) => {
//   try {
//     const { text, postId, userId, username } = req.body;

//     if (!text || !postId || !userId) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     const newComment = await CommentModel.create({
//       text,
//       postId,
//       user: { _id: userId, username: username }, // Ensure user details are included
//     });

//     res.status(201).json(newComment);
//   } catch (error) {
//     console.error("Error adding comment:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

app.post("/addcomment", async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Debugging

    const { text, user, post } = req.body;

    // Validate input
    if (!text || !user || !post) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (text.length > 250) {
      return res
        .status(400)
        .json({ message: "Comment exceeds character limit" });
    }

    // Validate that user exists
    const existingUser = await UserModel.findById(user);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate that post exists
    const existingPost = await PostModel.findById(post);
    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Create the comment
    const newComment = new CommentModel({
      text,
      user,
      post,
    });

    await newComment.save();

    // Add comment ID to post's comment array
    existingPost.comments.push(newComment._id);
    await existingPost.save();

    res
      .status(201)
      .json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

app.get("/getcomments/:postId", async (req, res) => {
  try {
    const comments = await CommentModel.find({ post: req.params.postId })
      .populate("user", "username") // Populate with username of commenter
      .sort({ createdAt: -1 }); // Sort by newest first

    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// edit a comment
app.put("/editcomment/:id", verifyUser, async (req, res) => {
  try {
    const { text } = req.body;
    const commentId = req.params.id;
    const userId = req._id; // Extract user ID from the token

    const comment = await CommentModel.findById(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (comment.user.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You can only edit your own comments" });
    }

    comment.text = text;
    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: "Error editing comment" });
  }
});

// delete a comment
app.delete("/deletecomment/:id", verifyUser, async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req._id; // Extract user ID from the token

    const comment = await CommentModel.findById(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (comment.user.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You can only delete your own comments" });
    }

    await CommentModel.findByIdAndDelete(commentId);
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting comment" });
  }
});

// upvote/downvote a comment
app.put("/upvote-comment/:id", verifyUser, async (req, res) => {
  try {
    const comment = await CommentModel.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Remove user from downvotes if present
    comment.downvotes = comment.downvotes.filter(
      (id) => id.toString() !== req._id
    );

    // Toggle upvote
    if (comment.upvotes.includes(req._id)) {
      comment.upvotes = comment.upvotes.filter(
        (id) => id.toString() !== req._id
      );
    } else {
      comment.upvotes.push(req._id);
    }

    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/downvote-comment/:id", verifyUser, async (req, res) => {
  try {
    const comment = await CommentModel.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Remove user from upvotes if present
    comment.upvotes = comment.upvotes.filter((id) => id.toString() !== req._id);

    // Toggle downvote
    if (comment.downvotes.includes(req._id)) {
      comment.downvotes = comment.downvotes.filter(
        (id) => id.toString() !== req._id
      );
    } else {
      comment.downvotes.push(req._id);
    }

    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
