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
    isFile,
    file,
    metadata,
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

  const callToGroup = async ({ creator, cecipientGroupId, messageBody }) => {
    await MessageService.sentMessageToGroup({
      creator,
      cecipientGroupId,
      messageBody,
      subject: "call",
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

  const callToFriend = async ({ creator, recipientId, messageBody }) => {
    await MessageService.sentMessageToUser({
      creator,
      recipientId,
      messageBody,
      subject: "call",
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

  //1 add 2 remove 3 leave
  const manageGroup = async ({ creator, cecipientGroupId, ids, type }) => {
    const users = await UserService.getInfoUserInIds(ids);
    const creatorUser = await UserService.getInfoByUserId(creator);
    let messageBody = "";
    if (type == 1) {
      const creatorName = creatorUser.username;
      const lst = users.map((u) => u.username);
      const name = lst.join(", ");
      messageBody = `${creatorName} add ${name} to this conversation`;
    } else if (type == 2) {
      const creatorName = creatorUser.username;
      const lst = users.map((u) => u.username);
      const name = lst.join(", ");
      messageBody = `${creatorName} remove ${name} to this conversation`;
      await GroupService.deleteUserFromGroup({
        ids,
        groupId: cecipientGroupId,
      });
    } else {
      const creatorName = creatorUser.username;
      messageBody = `${creatorName} leave this conversation`;
      await GroupService.deleteUserFromGroup({
        ids: [creator],
        groupId: cecipientGroupId,
      });
    }

    //
    await MessageService.sentMessageToGroup({
      creator,
      cecipientGroupId,
      messageBody,
      subject: "notification",
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

    const usersExceptOwnerRequest =
      await GroupService.getUserOfGroupExceptOwnerRequest({
        groupId: cecipientGroupId,
        userId: creator,
      });

    usersExceptOwnerRequest.forEach((user) => {
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

    if (type == 1) {
      await GroupService.addManyUserToGroup({ groupId: cecipientGroupId, ids });
      const users = await UserService.getInfoUserInIds(ids);
      users.forEach(async (user) => {
        const firstMessage = await MessageService.getFirstOfGroup({
          groupId: cecipientGroupId,
          userId: user._id.toString(),
        });
        if (user.isActive) {
          io.to(user.socketId).emit("be-added-to-new-group", firstMessage);
        }
      });
    } else if (type == 2) {
      const users = await UserService.getInfoUserInIds(ids);
      users.forEach(async (user) => {
        if (user.isActive) {
          io.to(user.socketId).emit("be-removed-from-group-chat-container", {
            groupId: cecipientGroupId,
          });
          io.to(user.socketId).emit("be-removed-from-group-sidebar", {
            groupId: cecipientGroupId,
          });
        }
      });
    } else {
      socket.emit("be-removed-from-group-chat-container", {
        groupId: cecipientGroupId,
      });
      socket.emit("be-removed-from-group-sidebar", {
        groupId: cecipientGroupId,
      });
    }
  };

  socket.on("call-to-group", callToGroup);
  socket.on("call-to-friend", callToFriend);
  socket.on("send-message-to-user", sendMessageToUser);
  socket.on("send-message-to-group", sendMessageToGroup);
  socket.on("manage-group", manageGroup);
};
