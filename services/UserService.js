const User = require("../models/userModel");
const Friend = require("../models/friendModel");
const Group = require("../models/groupModel");
const { handleError } = require("./handleErrorService");
const mongoose = require("mongoose");
async function createUser({ username, password }) {
  try {
    await User.create({ username, password });
  } catch (err) {
    handleError(err);
    throw new Error(err);
  }
}

async function findUserByUserName(username) {
  try {
    const user = await User.findOne({ username });
    return user;
  } catch (err) {
    handleError(err);
    throw new Error(err);
  }
}

async function getInfoByUserId(userId) {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (err) {
    handleError(err);
    throw new Error(err);
  }
}

async function getInfoUserInIds(ids) {
  try {
    const users = await User.aggregate([
      {
        $match: {
          _id: {
            $in: ids.map((id) => new mongoose.Types.ObjectId(id)),
          },
        },
      },
    ]);
    return users;
  } catch (err) {
    handleError(err);
    throw new Error(err);
  }
}

async function findUser(userid, name) {}

async function getAssociateId(userId) {
  const lstFriendId = await Friend.aggregate([
    {
      $match: {
        $or: [
          {
            firstUserId: new mongoose.Types.ObjectId(
              "647b5dc81184388da2392eda"
            ),
          },
          {
            secondUserId: new mongoose.Types.ObjectId(
              "647b5dc81184388da2392eda"
            ),
          },
        ],
      },
    },
    {
      $project: {
        id: "$id",
      },
    },
  ]);
  const lstGroupId = await Group.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId("647b5dc81184388da2392eda"),
      },
    },
    {
      $project: {
        id: "$id",
      },
    },
  ]);
  return [...lstFriendId.map((e) => e._id), ...lstGroupId.map((e) => e._id)];
}

async function updateSocketId(userId, socketId) {
  await User.findOneAndUpdate(
    { _id: userId },
    { socketId: socketId, isActive: true }
  );
}

module.exports = {
  createUser,
  findUserByUserName,
  getInfoByUserId,
  getAssociateId,
  updateSocketId,
  getInfoUserInIds,
};
