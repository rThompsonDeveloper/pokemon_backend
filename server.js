// Step 1: Initialize a new Node.js project
// This is done via the terminal with `npm init -y`

// Step 2: Install the necessary packages
// This is done via the terminal with `npm install express http socket.io`

// Step 3: Create an Express server
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json());

// Step 4: Set up a basic route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Step 5: Create an HTTP server with the Express app
const http = require("http");
const server = http.createServer(app);

// Step 6: Set up Socket.IO with the HTTP server
const io = require("socket.io")(server);

// Step 7: Define event handlers for Socket.IO
io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("message", (msg) => {
    console.log("message: " + msg);
    io.emit("message", msg);
  });
});

// Start the server
server.listen(3000, () => {
  console.log("listening on *:3000");
});
