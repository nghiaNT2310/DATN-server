const mongoose = require("mongoose");
const { handleError } = require("./handleErrorService");

async function connect() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/chat");
    console.log("connect mongodb successful");
  } catch (error) {
    handleError(error);
  }
}

module.exports = { connect };
