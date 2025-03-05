const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: String,
  description: String,
  file: String,
  email: String,
});

const PostModel = mongoose.model("posts", postSchema);

module.exports = PostModel;
