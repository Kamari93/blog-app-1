const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      maxlength: 250, // Limit character count
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", // References UserModel
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "posts", // References PostModel
      required: true,
    },
  },
  { timestamps: true }
);

const CommentModel = mongoose.model("comments", commentSchema, "comments");

module.exports = CommentModel;
