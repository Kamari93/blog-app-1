const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  email: String,
  password: String,
  securityQuestion: {
    type: String,
    default: "Who is your favorite author?",
  },
  securityAnswer: {
    type: String,
    required: true,
  },
  sessionExpiresAt: {
    type: Date,
    default: Date.now,
  },
});

const UserModel = mongoose.model("users", userSchema, "users");

module.exports = UserModel;
