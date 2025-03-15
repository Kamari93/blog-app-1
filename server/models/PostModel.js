const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    title: String,
    description: String,
    file: String,
    email: String,
    username: String, // Username of the user who created the post
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }], // Array of user IDs
    // createdAt: { type: Date, default: Date.now }, // Automatically sets timestamp
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

const PostModel = mongoose.model("posts", postSchema);

module.exports = PostModel;
