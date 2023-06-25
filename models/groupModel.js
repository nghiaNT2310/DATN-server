const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const groupSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    isActive: {
      type: Boolean,
      require: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      require: true,
    },
    avatar: {
      type: String,
      default:
        "https://firebasestorage.googleapis.com/v0/b/chat-f19b4.appspot.com/o/group.svg?alt=media&token=52343459-4577-4e92-8d8c-cda33d1b3c06",
    },
  },
  {
    timestamps: true,
  }
);

const Group = mongoose.model("group", groupSchema);
module.exports = Group;
