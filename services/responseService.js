const CODE_MESSAGE = {
  FAIL: { code: 0, message: "An error occurred, please try again!" },
  OK: { code: 1, message: "OK" },
  WRONG_USERNAME: { code: 3, message: "Wrong username" },
  WRONG_PASSWORD: { code: 4, message: "Wrong password" },
  USERNAME_EXIST: { code: 5, message: "username exist" },
  DUPLICATE_PARAM_KEY: { code: 6, message: "Duplicate parameter key" },
  BAD_REQUEST: { code: 400, message: "Bad request" },
  ACCESS_DENIED: {
    code: 403,
    message: "Access Denied You don’t have permission to access",
  },
  RESOURCE_NOT_EXIST: {
    code: 404,
    message: "Requested resource does not exist",
  },
  INTERNAL_SERVER_ERROR: {
    code: 500,
    message: "Internal Server Error",
  },
};

function respond(codeMessage, result) {
  return {
    code: codeMessage.code,
    message: codeMessage.message,
    result,
  };
}

module.exports = { CODE_MESSAGE, respond };
