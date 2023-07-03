const {
  createGroup,
  addUserToGroup,
  removeUserFromGroup,
  getById,
  getUserOfGroupExceptOwnerRequest,
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

async function getGroupInfo(req, res, next) {
  const data = await getById(req.params.id);
  res.send(data);
}

async function getListUserInGroupExceptOwnerRequest(req, res, next) {
  try {
    const data = await getUserOfGroupExceptOwnerRequest({
      groupId: req.params.id,
      userId: req.user.id,
    });
    res.send(data);
  } catch (err) {
    handleError(err);
  }
}

module.exports = {
  createNewGroup,
  addUser,
  getListFriendNotInGroup,
  getGroupInfo,
  getListUserInGroupExceptOwnerRequest,
};
