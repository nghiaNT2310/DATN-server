const {
  addFriend,
  unFriend,
  getFriendsId,
} = require("../services/FriendService");
const {
  getListFriendById,
  getListUserNotFriend,
} = require("../services/FriendService");

async function addFriendController(req, res, next) {
  await addFriend({ firstUserId: req.user.id, secondUserId: req.body.id });
  res.send("ok");
}

//will delete
async function getFriends(req, res, next) {
  const data = await getListFriendById(req.params.id);
  res.send(data);
}

async function exploreUser(req, res, next) {
  const data = await getListUserNotFriend(req.user.id, String(req.query.find));
  res.send(data);
}

async function getFriendId(req, res, next) {
  try {
    const data = await getFriendsId(req.query.id1, req.query.id2);
    res.send(data[0]._id);
  } catch (err) {
    res.send(err);
  }
}

module.exports = { addFriendController, getFriends, exploreUser, getFriendId };
