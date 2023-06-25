const UserService = require("../services/UserService");
const NotificationService = require("../services/NotificationService");
const FriendService = require("../services/FriendService");
const MessageService = require("../services/MessageService");
const GroupService = require("../services/GroupService");
const fileBaseService = require("../services/firebaseService");

module.exports = (io, socket) => {
  const sendMessageToUser = async ({
    creator,
    messageBody,
    recipientId,
    isFile,
    file,
    metadata,
  }) => {
    if (isFile) {
      await fileBaseService.uploadFile(metadata.name, file, metadata.type);
      const url = await fileBaseService.getUrl(metadata.name);
      messageBody = url;
    }
    await MessageService.sentMessageToUser({
      creator,
      messageBody,
      recipientId,
      subject: isFile ? metadata.type : "text",
    });

    const message = await MessageService.getNewMessageFriendForChatContainer({
      firstUserId: creator,
      secondUserId: recipientId,
    });
    const friend = await UserService.getInfoByUserId(recipientId);

    const messageUserGroup =
      await MessageService.getNewMessageFriendForUserGroup({
        sender: creator,
        receiver: recipientId,
      });

    socket.emit("new-message-chat-container", {
      chooseId: recipientId,
      isGroup: false,
      message: { ...message, avatar: friend.avatar },
    });

    socket.emit("new-message-side-bar", {
      ...messageUserGroup,
      id: recipientId,
      name: friend.username,
      avatar: friend.avatar,
    });

    if (friend.isActive) {
      io.to(friend.socketId).emit("new-message-chat-container", {
        chooseId: creator,
        isGroup: false,
        message: message,
      });

      io.to(friend.socketId).emit("new-message-side-bar", messageUserGroup);
    }
  };

  const sendMessageToGroup = async ({
    creator,
    messageBody,
    cecipientGroupId,
  }) => {
    if (isFile) {
      await fileBaseService.uploadFile(metadata.name, file, metadata.type);
      const url = await fileBaseService.getUrl(metadata.name);
      messageBody = url;
    }
    await MessageService.sentMessageToGroup({
      creator,
      messageBody,
      cecipientGroupId,
      subject: isFile ? metadata.type : "text",
    });

    const message = await MessageService.getNewMessageGroupForChatContainer({
      groupId: cecipientGroupId,
    });

    const messageUserGroupSender = await MessageService.getFirstOfGroup({
      groupId: cecipientGroupId,
      userId: creator,
    });

    socket.emit("new-message-chat-container", {
      chooseId: cecipientGroupId,
      isGroup: true,
      message: message,
    });

    socket.emit("new-message-side-bar", messageUserGroupSender);

    const users = await GroupService.getUserOfGroupExceptOwnerRequest({
      groupId: cecipientGroupId,
      userId: creator,
    });

    users.forEach((user) => {
      if (user.isActive) {
        io.to(user.socketId).emit("new-message-chat-container", {
          chooseId: cecipientGroupId,
          isGroup: true,
          message: message,
        });
        io.to(user.socketId).emit(
          "new-message-side-bar",
          messageUserGroupSender
        );
      }
    });
  };

  socket.on("send-message-to-user", sendMessageToUser);
  socket.on("send-message-to-group", sendMessageToGroup);
};
