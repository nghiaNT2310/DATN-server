const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },
    isActive: {
      type: Boolean,
      require: true,
    },
    socketId: {
      type: String,
    },
    avatar: {
      type: String,
      default:
        "https://firebasestorage.googleapis.com/v0/b/chat-f19b4.appspot.com/o/avata.svg?alt=media&token=f85eab3a-37e9-4b1e-b871-dc2cedf48b34",
    },
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model("user", userSchema);

module.exports = User;
