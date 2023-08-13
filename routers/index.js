const express = require("express");
const {
  register,
  login,
  getInfo,
  getInfoFriend,
  logoutController,
} = require("../controllers/UserController");
const {
  createNewGroup,
  addUser,
  getListFriendNotInGroup,
  getGroupInfo,
  getListUserInGroupExceptOwnerRequest,
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



router.get("/api/friend", getFriendId);

router.post("/api/sessions",authenticate, OVController.CreateSessionId);

router.post("/api/sessions/:sessionId/connections",authenticate, OVController.CreateSession);

router.post("/api/signup", hashPassword, register);

router.post("/api/signin", login);

router.get("/api/logout", authenticate,logoutController);

router.post("/api/group", authenticate, createNewGroup);

router.get("/api/info/friend/:id", getInfoFriend);

router.post("/api/usergroup", addUser); // will remove

router.post("/api/friend", authenticate, addFriendController); // will remove

router.post("/api/message/group", messageController.sentMessageToGroup); //will remove

router.post("/api/message", messageController.sentMessageToUser); //will remove

router.get("/api/message", authenticate, messageController.getMessage);

router.get("/api/test/:id", getFriends); //will delete

router.get(
  "/api/message/friend/:id",
  authenticate,
  messageController.getMessageByFriendId
);

router.get(
  "/api/message/group/:id",
  authenticate,
  messageController.getMessageByGroupId
);

router.get("/api/user", authenticate, getInfo);

router.get("/api/explore", authenticate, exploreUser);

router.get(
  "/api/notification",
  authenticate,
  notificationController.GetListNotification
);

router.get("/api/group-user/:groupId", authenticate, getListFriendNotInGroup);

router.post("/api/avatar", FirebaseController.uploadFile);

router.get("/api/avatar", FirebaseController.getLinkDownload);

router.get(
  "/api/group/user/:id",
  authenticate,
  getListUserInGroupExceptOwnerRequest
);

router.get("/api/group/:id", getGroupInfo);

router.get("/test/check", (req,res)=>{
  res.send("ok")
});

router.use(handleError);

module.exports = router;
