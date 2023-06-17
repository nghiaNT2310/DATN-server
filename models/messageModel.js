const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messagechema = new Schema(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      require: true,
    },
    subject: {
      type: String,
      require: true,
      default: "text",
    },
    messageBody: {
      type: String,
      require: "true",
    },
    parentMessageId: {
      type: Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);
const Message = mongoose.model("message", messagechema);

module.exports = Message;
