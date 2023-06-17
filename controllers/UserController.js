const {
  createUser,
  findUserByUserName,
  getInfoByUserId,
} = require("../services/UserService");
const { handleError } = require("../services/handleErrorService");
const { CODE_MESSAGE, respond } = require("../services/responseService");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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

module.exports = { register, login, getInfo };
