const UserService = require("../services/UserService");
const fileBaseService = require("../services/firebaseService");
module.exports = (io, socket) => {
  const getAssociateId = async (userId) => {
    // const lstId = await UserService.getAssociateId(userId);
    // console.log("lst:", lstId);
    // lstId.forEach((e) => {
    //   socket.join(e);
    // });
    console.log(userId);
    await UserService.updateSocketId(userId, socket.id);
  };

  const updateAvatar = async (data) => {
    try {
      await fileBaseService.uploadFile(data.name, data.file);
      const url = await fileBaseService.getUrl(data.name);
      await UserService.setAvatar(data.id, url);
      socket.emit("update-avatar");
    } catch (err) {
      console.log(err);
    }
  };

  socket.on("register-socket-id", getAssociateId);
  socket.on("update-avatar", updateAvatar);
};
