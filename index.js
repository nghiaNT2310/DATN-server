require("dotenv").config();
var express = require("express");
var bodyParser = require("body-parser");
var http = require("http");
var cors = require("cors");
var app = express();
const mongoService = require("./services/mongoService");
const route = require("./routers");
const { Server } = require("socket.io");
const userHandlers = require("./handler/userHandler");
const friendHandler = require("./handler/friendHandler");
const groupHandler = require("./handler/groupHandler");
const messageHandler = require("./handler/messageHandler");
var fileupload = require("express-fileupload");

var OPENVIDU_URL = process.env.OPENVIDU_URL || "192.168.1.91:4443";
// Environment variable: PORT where the node server is listening
var SERVER_PORT = process.env.SERVER_PORT || 5000;
// Enable CORS support
app.use(
  cors({
    origin: "*",
  })
);

var server = http.createServer(app);

// Allow application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// Allow application/json
app.use(bodyParser.json());

app.use(fileupload());

// Serve static resources if available
app.use(express.static(__dirname + "/public"));

// connect to mongoDB
mongoService.connect();

app.use(route);

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//   },
// });
const io = require("socket.io")(server, {
  path: "/test/",
  cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
      },
});
// const io = new Server({
//   server: server,
//   path: "/api/",
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//   },
// });

const onConnection = (socket) => {
  console.log(`User connected ${socket.id}`);
  userHandlers(io, socket);
  friendHandler(io, socket);
  groupHandler(io, socket);
  messageHandler(io, socket);
};

io.on("connection", onConnection);

// Serve application
server.listen(SERVER_PORT, () => {
  console.log("Application started on port: ", SERVER_PORT);
  console.warn("Application server connecting to OpenVidu at " + OPENVIDU_URL);
});

process.on("uncaughtException", (err) => console.error(err));
