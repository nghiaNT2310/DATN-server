const messageService = require("../services/MessageService");

async function sentMessageToUser(req, res, next) {
  await messageService.sentMessageToUser(req.body);
  res.send("ok");
}

async function sentMessageToGroup(req, res, next) {
  await messageService.sentMessageToGroup(req.body);
  res.send("ok");
}

async function getMessage(req, res, next) {
  data = await messageService.getMessage(req.user.id);
  res.send(data);
}

async function getMessageByFriendId(req, res, next) {
  data = await messageService.getMessageByFriendId(req.user.id, req.params.id);
  res.send(data);
}

async function getMessageByGroupId(req, res, next) {
  data = await messageService.getMessageByGroupId(req.user.id, req.params.id);
  res.send(data);
}

const messageController = {
  sentMessageToUser,
  sentMessageToGroup,
  getMessage,
  getMessageByFriendId,
  getMessageByGroupId,
};

module.exports = messageController;
