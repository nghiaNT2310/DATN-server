const UserService = require("../services/UserService");

module.exports = (io, socket) => {
  const createOrder = (payload) => {
    // ...
  };

  const getAssociateId = async (userId) => {
    // const lstId = await UserService.getAssociateId(userId);
    // console.log("lst:", lstId);
    // lstId.forEach((e) => {
    //   socket.join(e);
    // });
    console.log(userId);
    await UserService.updateSocketId(userId, socket.id);
  };

  socket.on("register-socket-id", getAssociateId);
};
