const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
    },
    receiver: {
      type: Schema.Types.ObjectId,
    },
    type: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    message: {
      type: String,
    },
    avatar: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
const Notification = mongoose.model("notification", notificationSchema);

module.exports = Notification;
