const {
  createGroup,
  addUserToGroup,
  removeUserFromGroup,
} = require("../services/GroupService");
const friendService = require("../services/FriendService");
const { handleError } = require("../services/handleErrorService");
const { CODE_MESSAGE, respond } = require("../services/responseService");

async function createNewGroup(req, res, next) {
  try {
    const response = await createGroup({
      name: req.body.name,
      creator: req.user.id,
      isActive: true,
    });

    await addUserToGroup({ userId: req.user.id, groupId: response._id });
    return res.send(respond(CODE_MESSAGE.OK));
  } catch (err) {
    handleError(err);
    next(err);
  }
}

async function addUser(req, res, next) {
  await addUserToGroup(req.body);
  res.send("ok");
}

async function getListFriendNotInGroup(req, res, next) {
  const lstUser = await friendService.getListFriendNotInGroup({
    userId: req.user.id,
    groupId: req.params.groupId,
  });
  res.send(lstUser);
}

module.exports = { createNewGroup, addUser, getListFriendNotInGroup };
