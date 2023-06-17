const UserService = require("../services/UserService");
const NotificationService = require("../services/NotificationService");
const FriendService = require("../services/FriendService");

module.exports = (io, socket) => {
  const addNotification = async ({ sender, receiver }) => {
    await NotificationService.AddNotification({
      sender,
      receiver,
      type: 1,
    });

    await NotificationService.AddNotification({
      sender,
      receiver,
      type: 2,
    });

    await FriendService.addFriend({
      firstUserId: sender,
      secondUserId: receiver,
    });

    const no1 = await NotificationService.filterAndgetFirst({
      sender,
      receiver,
      type: 1,
      isActive: true,
    });
    const no2 = await NotificationService.filterAndgetFirst({
      sender,
      receiver,
      type: 2,
      isActive: true,
    });
    const receiverInfo = await UserService.getInfoByUserId(receiver);
    if (receiverInfo.isActive) {
      io.to(receiverInfo.socketId).emit("notification-add-friend", no1);
    }
    socket.emit("notification-add-friend", no2);
  };

  const senderCancelAddFriend = async (notification) => {
    await FriendService.deleteRelationship({
      firstUserId: notification.sender,
      secondUserId: notification.receiver,
    });

    const no1 = await NotificationService.filterAndgetFirst({
      sender: notification.sender,
      receiver: notification.receiver,
      type: 1,
      isActive: true,
    });
    const no2 = await NotificationService.filterAndgetFirst({
      sender: notification.sender,
      receiver: notification.receiver,
      type: 2,
      isActive: true,
    });

    await NotificationService.inActiveNotification({
      sender: notification.sender,
      receiver: notification.receiver,
      type: 1,
    });

    await NotificationService.inActiveNotification({
      sender: notification.sender,
      receiver: notification.receiver,
      type: 2,
    });

    const receiverInfo = await UserService.getInfoByUserId(
      notification.receiver
    );
    if (receiverInfo.isActive) {
      io.to(receiverInfo.socketId).emit("notification-add-friend-cancel", no1);
    }
    socket.emit("notification-add-friend-cancel", no2);
  };

  const receiverRejectAddFriend = async (notification) => {
    await FriendService.deleteRelationship({
      firstUserId: notification.sender,
      secondUserId: notification.receiver,
    });

    const no1 = await NotificationService.filterAndgetFirst({
      sender: notification.sender,
      receiver: notification.receiver,
      type: 1,
      isActive: true,
    });
    const no2 = await NotificationService.filterAndgetFirst({
      sender: notification.sender,
      receiver: notification.receiver,
      type: 2,
      isActive: true,
    });

    await NotificationService.inActiveNotification({
      sender: notification.sender,
      receiver: notification.receiver,
      type: 1,
    });

    await NotificationService.inActiveNotification({
      sender: notification.sender,
      receiver: notification.receiver,
      type: 2,
    });

    const senderInfo = await UserService.getInfoByUserId(notification.sender);
    if (senderInfo.isActive) {
      io.to(senderInfo.socketId).emit("notification-add-friend-cancel", no2);
    }
    socket.emit("notification-add-friend-cancel", no1);
  };

  const receiverAcceptAddFriend = async (notification) => {
    await FriendService.acceptFriend({
      sender: notification.sender,
      receiver: notification.receiver,
    });

    const no1 = await NotificationService.filterAndgetFirst({
      sender: notification.sender,
      receiver: notification.receiver,
      type: 1,
      isActive: true,
    });
    const no2 = await NotificationService.filterAndgetFirst({
      sender: notification.sender,
      receiver: notification.receiver,
      type: 2,
      isActive: true,
    });

    await NotificationService.inActiveNotification({
      sender: notification.sender,
      receiver: notification.receiver,
      type: 1,
    });

    await NotificationService.inActiveNotification({
      sender: notification.sender,
      receiver: notification.receiver,
      type: 2,
    });

    const friend = await FriendService.findByFirstUserAndSecondUser({
      firstUserId: notification.sender,
      secondUserId: notification.receiver,
    });

    const senderInfo = await UserService.getInfoByUserId(notification.sender);
    const receiverInfo = await UserService.getInfoByUserId(
      notification.receiver
    );

    if (senderInfo.isActive) {
      io.to(senderInfo.socketId).emit("notification-add-friend-cancel", no2);
      io.to(senderInfo.socketId).emit("new-friend-conversation", {
        name: receiverInfo.username,
        id: receiverInfo._id,
        establishAt: friend.updatedAt,
        isGroup: false,
        isActive: receiverInfo.isActive,
      });
    }
    socket.emit("notification-add-friend-cancel", no1);
    socket.emit("new-friend-conversation", {
      name: senderInfo.username,
      id: senderInfo._id,
      establishAt: friend.updatedAt,
      isGroup: false,
      isActive: senderInfo.isActive,
    });
  };

  socket.on("add-friend", addNotification);
  socket.on("sender-cancel-add-friend", senderCancelAddFriend);
  socket.on("receiver-reject-add-friend", receiverRejectAddFriend);
  socket.on("receiver-accept-add-friend", receiverAcceptAddFriend);
};
