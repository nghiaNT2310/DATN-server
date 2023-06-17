const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userGroupSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      require: true,
    },
    groupId: {
      type: Schema.Types.ObjectId,
      require: true,
    },
    isActive: {
      type: Boolean,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);
const UserGroup = mongoose.model("user_group", userGroupSchema);

module.exports = UserGroup;
