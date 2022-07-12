require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const catchAsync = require('./utils/catchAsync')
var Cookies = require( "cookies" )
var jwt  = require('jsonwebtoken');
const { Server } = require("socket.io");
const http = require("http");
const app = express();
const user_routes = require('./routes/UserRoute.js');
const event_routes = require('./routes/EventRoute.js');
const modules_routes = require('./routes/ModulesRoute.js');
const Modules = require('./models/Modules.js')
app.use(express.json())


//base de donnée
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/ErrorController');
const { exemple } = require('./controllers/EventController.js');

// parse requests of content-type - application/json
app.use(bodyParser.json({}));
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true }));

var corsOptions = {
    origin: true,
    credentials: true
};
app.use(cors(corsOptions));
// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Shary server" });
});
// set port, listen for requests
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true
    })
    .then(() => {
        console.log("Connected to the database!");
    })
    .catch(err => {
        console.log("Cannot connect to the database!", err);
        process.exit();
    });


// ROUTES
app.use('/api/user', user_routes);
app.use('/api/event', event_routes);
app.use('/api/modules', modules_routes);

app.get("/meow/wouf", (req, res) => {
    res.json({ message: "Welcome to Shary server" });
});
app.get("/user/:id", (request, response) => {
	response.json({ name: "Existing Person" });
});


//  AFFICHAGE ERREUR JSON
app.all('*', (req, res, next)=>{
    //res.status(404).json({
    //    status : 'fail',
    //    message: `Can't find ${req.originalUrl} on this server!`
    //})
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);


// CHAT SOCKET SERVER

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("joinRoomEvent", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", catchAsync(async(data) => {
    console.log("le salon de provenance du message : chat" + data.event)
    console.log("La data :" + data)
    socket.to("chat" + data.event).emit("receive_message", data);
    let modules = await Modules.findOne({id_event:data.event})
    count = modules.chat.messages.size

    let infosMessage = {}

    infosMessage['chat.messages.message'+count] = {
        content : data.content,
        id_author : data.id_author
    }

    result = await Modules.updateOne({ id_event: data.event}, { "$set": infosMessage })
  }));

  socket.on("upload_file", catchAsync(async(data) => {
    socket.to(data.event).emit("receive_file", data);
    console.log(data)
  }));

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(3031, () => {
  console.log("CHAT SERVER RUNNING");
});