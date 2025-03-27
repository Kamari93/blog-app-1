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
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "comments", // References CommentModel
      },
    ],
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

const PostModel = mongoose.model("posts", postSchema);

module.exports = PostModel;
