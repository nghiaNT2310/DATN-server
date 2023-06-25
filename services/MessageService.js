const Message = require("../models/messageModel");
const MessageRecipient = require("../models/messageRecipientModel");
const UserGroup = require("../models/userGroupModel");
const Group = require("../models/groupModel");
const { getListFriendById } = require("./FriendService");
const { getGroupByUserId } = require("./GroupService");
const mongoose = require("mongoose");
const User = require("../models/userModel");

async function sentMessageToUser({ creator, messageBody, recipientId }) {
  const message = await Message.create({
    creatorId: creator,
    messageBody: messageBody,
  });

  await MessageRecipient.create({
    recipientId: recipientId,
    messageId: message._id,
    isRead: false,
  });
}

async function sentMessageToGroup({ creator, messageBody, cecipientGroupId }) {
  const message = await Message.create({
    creatorId: creator,
    messageBody: messageBody,
  });

  await MessageRecipient.create({
    messageId: message._id,
    recipientGroupId: cecipientGroupId,
    isRead: false,
  });
}

async function getListMessageFriendOfUser(userId) {
  const lstFriend = await getListFriendById(userId);
  const overviewMessageToFriend = await Promise.all(
    lstFriend.map((element) => {
      return MessageRecipient.aggregate([
        {
          $lookup: {
            from: "messages",
            localField: "messageId",
            foreignField: "_id",
            as: "message",
          },
        },
        {
          $unwind: {
            path: "$message",
          },
        },
        {
          $match: {
            $or: [
              {
                recipientId: new mongoose.Types.ObjectId(element.friendId),
                "message.creatorId": new mongoose.Types.ObjectId(userId),
              },
              {
                "message.creatorId": new mongoose.Types.ObjectId(
                  element.friendId
                ),
                recipientId: new mongoose.Types.ObjectId(userId),
              },
            ],
            recipientGroupId: null,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $limit: 1,
        },
        {
          $project: {
            _id: 0,
            createdAt: "$createdAt",
            message: "$message.messageBody",
            subject: "$message.subject",
          },
        },
      ]);
    })
  );
  for (let i = 0; i < overviewMessageToFriend.length; i++) {
    overviewMessageToFriend[i] = {
      ...overviewMessageToFriend[i][0],
      name: lstFriend[i].username,
      isActive: lstFriend[i].isActive,
      isGroup: false,
      id: lstFriend[i].friendId,
      establishAt: lstFriend[i].friendAt,
      avatar: lstFriend[i].avatar,
    };
  }
  return overviewMessageToFriend;
}

async function getListMessageGroupOfUser(userId) {
  const lstGroup = await getGroupByUserId(userId);
  const messages = await Promise.all(
    lstGroup.map((element) => {
      return MessageRecipient.aggregate([
        {
          $lookup: {
            from: "messages",
            localField: "messageId",
            foreignField: "_id",
            as: "message",
          },
        },
        {
          $unwind: {
            path: "$message",
          },
        },
        {
          $match: {
            recipientGroupId: new mongoose.Types.ObjectId(element.groupId),
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $limit: 1,
        },
        {
          $project: {
            _id: 0,
            createdAt: "$createdAt",
            message: "$message.messageBody",
            subject: "$message.subject",
          },
        },
      ]);
    })
  );

  for (let i = 0; i < messages.length; i++) {
    messages[i] = {
      ...messages[i][0],
      name: lstGroup[i].name,
      isActive: lstGroup[i].isActive,
      id: lstGroup[i].groupId,
      isGroup: true,
      establishAt: lstGroup[i].createdGroupAt,
      avatar: lstGroup[i].avatar,
    };
  }
  return messages;
}

async function getMessage(userId) {
  const friendMessages = await getListMessageFriendOfUser(userId);
  const groupMessages = await getListMessageGroupOfUser(userId);
  const messages = [...friendMessages, ...groupMessages];

  messages.sort((a, b) => {
    if (a.createdAt && b.createdAt) return b.createdAt - a.createdAt;
    if (b.createdAt) return b.createdAt - a.establishAt;
    if (a.createdAt) return b.establishAt - a.createdAt;
    return b.establishAt - a.establishAt;
  });
  return messages;
}

async function getMessageByFriendId(userId, friendId) {
  const message = await MessageRecipient.aggregate([
    {
      $lookup: {
        from: "messages",
        localField: "messageId",
        foreignField: "_id",
        as: "message",
      },
    },
    {
      $unwind: {
        path: "$message",
      },
    },
    {
      $match: {
        $or: [
          {
            recipientId: new mongoose.Types.ObjectId(userId),
            "message.creatorId": new mongoose.Types.ObjectId(friendId),
          },
          {
            recipientId: new mongoose.Types.ObjectId(friendId),
            "message.creatorId": new mongoose.Types.ObjectId(userId),
          },
        ],
        recipientGroupId: null,
      },
    },
    {
      $project: {
        createdAt: "$createdAt",
        recipientId: "$recipientId",
        creatorId: "$message.creatorId",
        isRead: "$isRead",
        messageId: "$messageId",
        message: "$message.messageBody",
        subject: "$message.subject",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "recipientId",
        foreignField: "_id",
        as: "recipient",
      },
    },
    {
      $unwind: {
        path: "$recipient",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "creatorId",
        foreignField: "_id",
        as: "creator",
      },
    },
    {
      $unwind: {
        path: "$creator",
      },
    },
    {
      $project: {
        messageBody: "$message",
        createdAt: "$createdAt",
        subject: "$subject",
        creator: "$creator.username",
        avatar: "$creator.avatar",
      },
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
  ]);
  return message;
}

async function getMessageByGroupId(userId, groupId) {
  const message = await MessageRecipient.aggregate([
    {
      $match: {
        recipientGroupId: new mongoose.Types.ObjectId(groupId),
      },
    },
    {
      $lookup: {
        from: "messages",
        localField: "messageId",
        foreignField: "_id",
        as: "message",
      },
    },
    {
      $unwind: {
        path: "$message",
      },
    },
    {
      $project: {
        messageBody: "$message.messageBody",
        createdAt: "$createdAt",
        creatorId: "$message.creatorId",
        subject: "$message.subject",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "creatorId",
        foreignField: "_id",
        as: "creator",
      },
    },
    {
      $unwind: {
        path: "$creator",
      },
    },
    {
      $project: {
        messageBody: "$messageBody",
        createdAt: "$createdAt",
        subject: "$subject",
        creator: "$creator.username",
        avatar: "$creator.avatar",
      },
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
  ]);
  return message;
}

async function getFirstOfGroup({ groupId, userId }) {
  const group = await Group.findById(groupId);
  const userGroup = await UserGroup.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    groupId: new mongoose.Types.ObjectId(groupId),
  });

  const message = await MessageRecipient.aggregate([
    {
      $lookup: {
        from: "messages",
        localField: "messageId",
        foreignField: "_id",
        as: "message",
      },
    },
    {
      $unwind: {
        path: "$message",
      },
    },
    {
      $match: {
        recipientGroupId: new mongoose.Types.ObjectId(groupId),
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $limit: 1,
    },
    {
      $project: {
        _id: 0,
        createdAt: "$createdAt",
        message: "$message.messageBody",
        subject: "$message.subject",
      },
    },
  ]);

  return {
    ...message[0],
    name: group.name,
    isActive: group.isActive,
    id: group._id,
    isGroup: true,
    establishAt: userGroup.createdAt,
    avatar: group.avatar,
  };
}

async function getNewMessageFriendForChatContainer({
  firstUserId,
  secondUserId,
}) {
  const message = await MessageRecipient.aggregate([
    {
      $lookup: {
        from: "messages",
        localField: "messageId",
        foreignField: "_id",
        as: "message",
      },
    },
    {
      $unwind: {
        path: "$message",
      },
    },
    {
      $match: {
        $or: [
          {
            recipientId: new mongoose.Types.ObjectId(firstUserId),
            "message.creatorId": new mongoose.Types.ObjectId(secondUserId),
          },
          {
            recipientId: new mongoose.Types.ObjectId(secondUserId),
            "message.creatorId": new mongoose.Types.ObjectId(firstUserId),
          },
        ],
        recipientGroupId: null,
      },
    },
    {
      $project: {
        createdAt: "$createdAt",
        recipientId: "$recipientId",
        creatorId: "$message.creatorId",
        isRead: "$isRead",
        messageId: "$messageId",
        message: "$message.messageBody",
        subject: "$message.subject",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "recipientId",
        foreignField: "_id",
        as: "recipient",
      },
    },
    {
      $unwind: {
        path: "$recipient",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "creatorId",
        foreignField: "_id",
        as: "creator",
      },
    },
    {
      $unwind: {
        path: "$creator",
      },
    },
    {
      $project: {
        messageBody: "$message",
        createdAt: "$createdAt",
        subject: "$subject",
        creator: "$creator.username",
        avatar: "$creator.avatar",
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $limit: 1,
    },
  ]);
  return message[0];
}

async function getNewMessageFriendForUserGroup({ sender, receiver }) {
  const senderInfo = await User.findById(sender);
  const message = await MessageRecipient.aggregate([
    {
      $lookup: {
        from: "messages",
        localField: "messageId",
        foreignField: "_id",
        as: "message",
      },
    },
    {
      $unwind: {
        path: "$message",
      },
    },
    {
      $match: {
        $or: [
          {
            recipientId: new mongoose.Types.ObjectId(sender),
            "message.creatorId": new mongoose.Types.ObjectId(receiver),
          },
          {
            "message.creatorId": new mongoose.Types.ObjectId(sender),
            recipientId: new mongoose.Types.ObjectId(receiver),
          },
        ],
        recipientGroupId: null,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $limit: 1,
    },
    {
      $project: {
        _id: 0,
        createdAt: "$createdAt",
        message: "$message.messageBody",
        subject: "$message.subject",
      },
    },
  ]);
  return {
    ...message[0],
    name: senderInfo.username,
    isActive: senderInfo.isActive,
    isGroup: false,
    id: senderInfo._id,
    avatar: senderInfo.avatar,
  };
}

async function getNewMessageGroupForChatContainer({ groupId }) {
  const messages = await MessageRecipient.aggregate([
    {
      $match: {
        recipientGroupId: new mongoose.Types.ObjectId(groupId),
      },
    },
    {
      $lookup: {
        from: "messages",
        localField: "messageId",
        foreignField: "_id",
        as: "message",
      },
    },
    {
      $unwind: {
        path: "$message",
      },
    },
    {
      $project: {
        messageBody: "$message.messageBody",
        createdAt: "$createdAt",
        creatorId: "$message.creatorId",
        subject: "$message.subject",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "creatorId",
        foreignField: "_id",
        as: "creator",
      },
    },
    {
      $unwind: {
        path: "$creator",
      },
    },
    {
      $project: {
        messageBody: "$messageBody",
        createdAt: "$createdAt",
        subject: "$subject",
        creator: "$creator.username",
        avatar: "$creator.avatar",
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $limit: 1,
    },
  ]);
  return messages[0];
}

const MessageService = {
  sentMessageToUser,
  sentMessageToGroup,
  getListMessageFriendOfUser,
  getListMessageGroupOfUser,
  getMessage,
  getMessageByFriendId,
  getMessageByGroupId,
  getFirstOfGroup,
  getNewMessageFriendForChatContainer,
  getNewMessageFriendForUserGroup,
  getNewMessageGroupForChatContainer,
};
module.exports = MessageService;
