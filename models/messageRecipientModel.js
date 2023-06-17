const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageRecipientchema = new Schema(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
    },
    recipientGroupId: {
      type: Schema.Types.ObjectId,
    },
    messageId: {
      type: Schema.Types.ObjectId,
      require: true,
    },
    isRead: {
      type: Boolean,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);
const MessageRecipient = mongoose.model(
  "messageRecipient",
  messageRecipientchema
);

module.exports = MessageRecipient;
