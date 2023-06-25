const Friend = require("../models/friendModel");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const GroupService = require("./GroupService");

const { handleError } = require("./handleErrorService");

async function addFriend({ firstUserId, secondUserId }) {
  try {
    await Friend.create({ firstUserId, secondUserId, isActive: false });
  } catch (err) {
    handleError(err);
    throw new Error(err);
  }
}

async function unFriend(id) {
  try {
    await Friend.findByIdAndDelete(id);
  } catch (err) {
    handleError(err);
    throw new Error(err);
  }
}

async function acceptFriend({ sender, receiver }) {
  try {
    await Friend.findOneAndUpdate(
      { firstUserId: sender, secondUserId: receiver, status: 1 },
      { status: 2 },
      { returnNewDocument: true }
    );
  } catch (err) {
    handleError(err);
    throw new Error(err);
  }
}

async function getListFriendById(id) {
  try {
    const data = await Friend.aggregate([
      [
        {
          $match: {
            $or: [
              {
                firstUserId: new mongoose.Types.ObjectId(id),
              },
              {
                secondUserId: new mongoose.Types.ObjectId(id),
              },
            ],
            status: 2,
          },
        },
        {
          $project: {
            friendId: {
              $cond: {
                if: {
                  $eq: ["$firstUserId", new mongoose.Types.ObjectId(id)],
                },
                then: "$secondUserId",
                else: "$firstUserId",
              },
            },
            friendAt: "$updatedAt",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "friendId",
            foreignField: "_id",
            as: "friend",
          },
        },
        {
          $unwind: {
            path: "$friend",
          },
        },
        {
          $project: {
            friendId: "$friendId",
            username: "$friend.username",
            isActive: "$friend.isActive",
            friendAt: "$friendAt",
            socketId: "$friend.socketId",
            avatar: "$friend.avatar",
          },
        },
      ],
    ]).exec();

    return data;
  } catch (err) {
    handleError(err);
    throw new Error(err);
  }
}

async function getListUserNotFriend(id, namefind) {
  const lstUser = await User.aggregate([
    {
      $match: {
        _id: {
          $ne: new mongoose.Types.ObjectId(id),
        },
      },
    },
    {
      $project: {
        _id: 0,
        id: {
          $toString: "$_id",
        },
        username: 1,
        avatar: 1,
      },
    },
    {
      $match: {
        username: { $regex: namefind },
      },
    },
  ]);

  let lstFriend = await Friend.aggregate([
    {
      $match: {
        $or: [
          {
            firstUserId: new mongoose.Types.ObjectId(id),
          },
          {
            secondUserId: new mongoose.Types.ObjectId(id),
          },
        ],
        status: {
          $in: [1, 2],
        },
      },
    },
    {
      $project: {
        _id: 0,
        id: {
          $cond: {
            if: {
              $eq: ["$firstUserId", new mongoose.Types.ObjectId(id)],
            },
            then: {
              $toString: "$secondUserId",
            },
            else: {
              $toString: "$firstUserId",
            },
          },
        },
      },
    },
  ]);

  lstFriend = lstFriend.map((e) => e.id);
  return lstUser.filter((e) => !lstFriend.includes(e.id));
}

async function deleteRelationship({ firstUserId, secondUserId }) {
  await Friend.findOneAndDelete({ firstUserId, secondUserId });
}

async function findByFirstUserAndSecondUser({ firstUserId, secondUserId }) {
  return await Friend.findOne({ firstUserId, secondUserId });
}

async function getListFriendNotInGroup({ userId, groupId }) {
  const lstFriend = await Friend.aggregate([
    {
      $match: {
        $or: [
          {
            firstUserId: new mongoose.Types.ObjectId(userId),
          },
          {
            secondUserId: new mongoose.Types.ObjectId(userId),
          },
        ],
        status: 2,
      },
    },
    {
      $project: {
        friendId: {
          $cond: {
            if: {
              $eq: ["$firstUserId", new mongoose.Types.ObjectId(userId)],
            },
            then: "$secondUserId",
            else: "$firstUserId",
          },
        },
        isActive: "$isActive",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "friendId",
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
        friendId: "$friendId",
        username: "$user.username",
        isActive: "$user.isActive",
      },
    },
  ]);

  const lstUserIdInGroup = await GroupService.getListUserIdInGroup(groupId);
  return lstFriend.filter((e) => {
    return !lstUserIdInGroup.includes(e.friendId.toString());
  });
}

async function getFriendsId(firstUserId, secondUserId) {
  try {
    const friend = await Friend.aggregate([
      {
        $match: {
          $or: [
            {
              firstUserId: new mongoose.Types.ObjectId(firstUserId),
              secondUserId: new mongoose.Types.ObjectId(secondUserId),
            },
            {
              firstUserId: new mongoose.Types.ObjectId(secondUserId),
              secondUserId: new mongoose.Types.ObjectId(firstUserId),
            },
          ],
        },
      },
    ]);
    return friend;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  addFriend,
  unFriend,
  getListFriendById,
  getListUserNotFriend,
  deleteRelationship,
  acceptFriend,
  findByFirstUserAndSecondUser,
  getListFriendNotInGroup,
  getFriendsId,
};
