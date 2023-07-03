const Group = require("../models/groupModel");
const UserGroup = require("../models/userGroupModel");
const { handleError } = require("./handleErrorService");
const mongoose = require("mongoose");

async function createGroup({ name, creator, isActive }) {
  try {
    const newGroup = await Group.create({ name, creator, isActive });
    return newGroup;
  } catch (err) {
    handleError(err);
    throw new Error(err);
  }
}

async function addUserToGroup({ userId, groupId }) {
  try {
    await UserGroup.create({ userId, groupId });
  } catch (err) {
    handleError(err);
    throw new Error(err);
  }
}

async function removeUserFromGroup(id) {
  try {
    await UserGroup.findByIdAndDelete(id);
  } catch (err) {
    handleError(err);
    throw new Error(err);
  }
}

async function getGroupByUserId(id) {
  try {
    const data = await UserGroup.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "groups",
          localField: "groupId",
          foreignField: "_id",
          as: "group",
        },
      },
      {
        $unwind: {
          path: "$group",
        },
      },
      {
        $project: {
          _id: 0,
          name: "$group.name",
          groupId: "$groupId",
          isActive: "$group.isActive",
          createdGroupAt: "$group.updatedAt",
          avatar: "$group.avatar",
        },
      },
    ]);
    return data;
  } catch (err) {}
}

async function getListUserIdInGroup(groupId) {
  const lstId = await UserGroup.aggregate([
    {
      $match: {
        groupId: new mongoose.Types.ObjectId(groupId),
      },
    },
  ]);
  return lstId.map((e) => e.userId.toString());
}

async function addManyUserToGroup({ groupId, ids }) {
  await UserGroup.insertMany(
    ids.map((id) => {
      return {
        userId: id,
        groupId,
      };
    })
  );
}

async function getGroupById(groupId) {
  return await Group.findById(groupId);
}

async function getUserOfGroupExceptOwnerRequest({ groupId, userId }) {
  const users = await UserGroup.aggregate([
    {
      $match: {
        groupId: new mongoose.Types.ObjectId(groupId),
        userId: {
          $ne: new mongoose.Types.ObjectId(userId),
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: {
        path: "$user",
      },
    },
    {
      $project: {
        _id: 0,
        userId: 1,
        isActive: "$user.isActive",
        socketId: "$user.socketId",
        username: "$user.username",
        avatar: "$user.avatar",
      },
    },
  ]);
  return users;
}

async function setAvatar(id, url) {
  const res = await User.findByIdAndUpdate(id, { avatar: url });
  return res;
}

async function getById(id) {
  const group = await Group.findById(id);
  return group;
}

async function deleteUserFromGroup({ ids, groupId }) {
  try {
    await UserGroup.deleteMany({
      userId: {
        $in: ids.map((id) => new mongoose.Types.ObjectId(id)),
      },
      groupId: new mongoose.Types.ObjectId(groupId),
    });
  } catch (err) {
    throw err;
  }
}

async function leaveGroup({ ids, groupId }) {
  try {
    await UserGroup.updateMany(
      {
        userId: {
          $in: ids.map((id) => new mongoose.Types.ObjectId(id)),
        },
        groupId: new mongoose.Types.ObjectId(groupId),
      },
      {
        isActive: false,
      }
    );
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createGroup,
  addUserToGroup,
  removeUserFromGroup,
  getGroupByUserId,
  getListUserIdInGroup,
  addManyUserToGroup,
  getGroupById,
  getUserOfGroupExceptOwnerRequest,
  setAvatar,
  getById,
  deleteUserFromGroup,
  leaveGroup,
};
