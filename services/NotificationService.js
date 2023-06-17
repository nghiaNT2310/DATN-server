const Notification = require("../models/notificationModel");
const mongoose = require("mongoose");
const UserService = require("../services/UserService");

async function AddNotification({ sender, receiver, type }) {
  console.log("c:", sender, receiver);
  const userSender = await UserService.getInfoByUserId(sender);
  const userReceiver = await UserService.getInfoByUserId(receiver);
  const messageContent =
    type == 1
      ? `${userSender.username} da gui loi moi ket ban den ban`
      : `Ban da gui loi moi ket ban den ${userReceiver.username}`;
  await Notification.create({
    sender,
    receiver,
    type,
    message: messageContent,
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
