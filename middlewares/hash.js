const bcrypt = require("bcrypt");

function hashPassword(req, res, next) {
  const { password } = req.body;
  const salt = bcrypt.genSaltSync(parseInt(process.env.SALT_ROUNDS));
  const hash = bcrypt.hashSync(password, salt);
  req.body.password = hash;
  next();
}

module.exports = { hashPassword };
