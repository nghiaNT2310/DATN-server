const express = require("express");
const { register, login, getInfo } = require("../controllers/UserController");
const {
  createNewGroup,
  addUser,
  getListFriendNotInGroup,
} = require("../controllers/GroupController");
const {
  addFriendController,
  getFriends,
  exploreUser,
} = require("../controllers/FriendController");
const { hashPassword } = require("../middlewares/hash");
const { handleError } = require("../middlewares/handleError");
const { authenticate } = require("../middlewares/authenticate");
const messageController = require("../controllers/MessageController");
const notificationController = require("../controllers/NotificationController");

const router = express.Router();

router.post("/signup", hashPassword, register);

router.post("/signin", login);

router.post("/group", authenticate, createNewGroup);

router.post("/usergroup", addUser); // will remove

router.post("/friend", authenticate, addFriendController); // will remove

router.post("/message/group", messageController.sentMessageToGroup); //will remove

router.post("/message", messageController.sentMessageToUser); //will remove

router.get("/message", authenticate, messageController.getMessage);

router.get("/test/:id", getFriends); //will delete

router.get(
  "/message/friend/:id",
  authenticate,
  messageController.getMessageByFriendId
);

router.get(
  "/message/group/:id",
  authenticate,
  messageController.getMessageByGroupId
);

router.get("/user", authenticate, getInfo);

router.get("/explore", authenticate, exploreUser);

router.get(
  "/notification",
  authenticate,
  notificationController.GetListNotification
);

router.get("/group-user/:groupId", authenticate, getListFriendNotInGroup);

router.use(handleError);

module.exports = router;
