const express = require("express");
const app = express();
const http = require('http').Server(app)
const path = require('path'); 
let router = express.Router();
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const cookieParser = require('cookie-parser');
const cors = require('cors');
const axios = require('axios');
const manager = require("./manager");

app.use("/room", router);
router.use("/static", express.static(path.join(__dirname, 'public')))
app.use(cookieParser());
app.use(express.json())
app.use(cors())

const testing = process.env.TESTING == 'true'

app.get("/", (req, res) => {
    res.send("");
})
//Creates a random room and redirects to that room url
router.get('/', async (req, res) => {
    try {
        console.log('Creating new room..')
        let room = await manager.createRoom()
        res.redirect('/room/' + room.id)
    }catch (error) {
        res.status(500).send(error)
    }
})

//Connects to said room url
router.get("/:roomId", async (req,res) => {

    let roomId = req.params.roomId

    try {
        roomInfo = await manager.getRoom(roomId)

        res.cookie('roomId', roomId);
        res.cookie('socketUrl', roomInfo.socketUrl);
        res.cookie('signallingUrl', roomInfo.signallingUrl);
        
        res.sendFile(__dirname + getRoomHttpPath(testing))
    } catch (error) {
        res.status(404).send('Room not found.')
        console.log(error)
    }
})

http.listen("3000", () => {
    console.log("Yggdrasil is up!")
})

function getRoomHttpPath (testFile) {
    if (testFile) {
        return '/public/client_test/TestRunner.html'
    }else{
        return '/public/html/room.html'
    }
}