const Notification = require("../models/notificationModel");
const mongoose = require("mongoose");
const UserService = require("../services/UserService");

async function AddNotification({ sender, receiver, type, avatar }) {
  const userSender = await UserService.getInfoByUserId(sender);
  const userReceiver = await UserService.getInfoByUserId(receiver);
  const messageContent =
    type == 1
      ? `${userSender.username} sent you a friend request`
      : `You have sent a friend request to ${userReceiver.username}`;
  await Notification.create({
    sender,
    receiver,
    type,
    message: messageContent,
    avatar: avatar,
  });
}

async function AddNotificationGroup({
  sender,
  receiver,
  messageContent,
  avatar,
}) {
  const userSender = await UserService.getInfoByUserId(sender);
  const userReceiver = await UserService.getInfoByUserId(receiver);
  await Notification.create({
    sender,
    receiver,
    type,
    message: messageContent,
    avatar: avatar,
  });
}

async function getListNotification(userId) {
  const notifications = await Notification.aggregate([
    {
      $match: {
        $or: [
          {
            sender: new mongoose.Types.ObjectId(userId),
            type: 2,
          },
          {
            receiver: new mongoose.Types.ObjectId(userId),
            type: 1,
          },
        ],
        isActive: true,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);
  return notifications;
}

async function filterAndgetFirst({ sender, receiver, type, isActive }) {
  const notification = await Notification.findOne({
    sender,
    receiver,
    type,
    isActive,
  });
  return notification;
}

async function inActiveNotification({ sender, receiver, type }) {
  await Notification.findOneAndUpdate(
    { sender: sender, receiver: receiver, type: type, isActive: true },
    { isActive: false }
  );
}

module.exports = {
  AddNotification,
  getListNotification,
  filterAndgetFirst,
  inActiveNotification,
};
