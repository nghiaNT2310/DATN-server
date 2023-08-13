const {
  createUser,
  findUserByUserName,
  getInfoByUserId,
  setAvatar,
  logout,
  activeUser
} = require("../services/UserService");
const { handleError } = require("../services/handleErrorService");
const { CODE_MESSAGE, respond } = require("../services/responseService");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fileBaseService = require("../services/firebaseService");

async function register(req, res, next) {
  try {
    const user = await findUserByUserName(req.body.username);
    if (user) {
      return res.send(respond(CODE_MESSAGE.USERNAME_EXIST));
    }
    await createUser(req.body);
    return res.send(respond(CODE_MESSAGE.OK));
  } catch (err) {
    handleError(err);
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const user = await findUserByUserName(req.body.username);

    if (!user) {
      return res.send(respond(CODE_MESSAGE.WRONG_USERNAME));
    }

    if (!bcrypt.compareSync(req.body.password, user.password)) {
      return res.send(respond(CODE_MESSAGE.WRONG_PASSWORD));
    }

    // if(user.isActive){
    //   return res.send(respond(CODE_MESSAGE.ACCOUNT_ISACTIVE))
    // }

    await activeUser(user._id)
    

    var token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_KEY
    );
    return res.send(respond(CODE_MESSAGE.OK, { token }));
  } catch (err) {
    handleError(err);
    next(err);
  }
}

async function getInfo(req, res, next) {
  const user = await getInfoByUserId(req.user.id);
  res.send(user);
}

async function getInfoFriend(req, res, next) {
  const user = await getInfoByUserId(req.params.id);
  res.send(user);
}

async function logoutController(req,res,next){
  await logout(req.user.id);
  res.send("ok")
}

module.exports = { register, login, getInfo, getInfoFriend,logoutController };
