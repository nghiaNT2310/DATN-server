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
  },
  {
    timestamps: true,
  }
);

const Group = mongoose.model("group", groupSchema);
module.exports = Group;
