const UserService = require("../services/UserService");
const NotificationService = require("../services/NotificationService");
const FriendService = require("../services/FriendService");
const MessageService = require("../services/MessageService");
const GroupService = require("../services/GroupService");

module.exports = (io, socket) => {
  const createGroup = async (data) => {
    const response = await GroupService.createGroup({
      name: data.groupName,
      creator: data.creator,
      isActive: true,
    });

    await GroupService.addUserToGroup({
      userId: data.creator,
      groupId: response._id,
    });

    socket.emit("add-to-new-group", {
      name: response.name,
      id: response._id,
      establishAt: response.createdAt,
      isGroup: true,
      isActive: response.isActive,
    });
  };

  const addUserTOGroupHandler = async ({ groupId, ids }) => {
    await GroupService.addManyUserToGroup({ groupId, ids });
    const users = await UserService.getInfoUserInIds(ids);
    users.forEach(async (user) => {
      const firstMessage = await MessageService.getFirstOfGroup({
        groupId,
        userId: user._id.toString(),
      });
      if (user.isActive) {
        io.to(user.socketId).emit("be-added-to-new-group", firstMessage);
      }
    });
  };

  socket.on("create-group", createGroup);
  socket.on("add-user-to-group", addUserTOGroupHandler);
};
