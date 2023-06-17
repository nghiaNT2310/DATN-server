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
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model("user", userSchema);

module.exports = User;
