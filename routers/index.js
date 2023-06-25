const express = require("express");
const {
  register,
  login,
  getInfo,
  getInfoFriend,
} = require("../controllers/UserController");
const {
  createNewGroup,
  addUser,
  getListFriendNotInGroup,
  getGroupInfo,
} = require("../controllers/GroupController");
const {
  addFriendController,
  getFriends,
  exploreUser,
  getFriendId,
} = require("../controllers/FriendController");
const { hashPassword } = require("../middlewares/hash");
const { handleError } = require("../middlewares/handleError");
const { authenticate } = require("../middlewares/authenticate");
const messageController = require("../controllers/MessageController");
const notificationController = require("../controllers/NotificationController");
const OVController = require("../controllers/OVController");
const FirebaseController = require("../controllers/firebaseController");
const router = express.Router();

router.get("/friend", getFriendId);

router.post("/api/sessions", OVController.CreateSessionId);

router.post("/api/sessions/:sessionId/connections", OVController.CreateSession);

router.post("/signup", hashPassword, register);

router.post("/signin", login);

router.post("/group", authenticate, createNewGroup);

router.get("/info/friend/:id", getInfoFriend);

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

router.post("/avatar", FirebaseController.uploadFile);

router.get("/avatar", FirebaseController.getLinkDownload);

router.get("/group/:id", getGroupInfo);

router.use(handleError);

module.exports = router;
