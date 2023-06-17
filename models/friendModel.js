const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const friendSchema = new Schema(
  {
    firstUserId: {
      type: Schema.Types.ObjectId,
      require: true,
    },
    secondUserId: {
      type: Schema.Types.ObjectId,
      require: true,
    },
    status: {
      type: Number, //1 pending 2 complete
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);
const Friend = mongoose.model("friend", friendSchema);

module.exports = Friend;
