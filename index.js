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
const axios = require('axios')

app.use("/room", router);
router.use("/static", express.static(path.join(__dirname, 'public')))
app.use(cookieParser());
app.use(express.json())
app.use(cors())

const roomManagerUrl = process.env.ROOM_MANAGER_URL
const socketUrl = process.env.SOCKET_URL
app.get("/", (req, res) => {
    res.send("");
})

router.get('/', async (req, res) => {
    try {
        console.log('Creating new room..')
        let room = (await axios.post(roomManagerUrl + '/rooms', {socketUrl: socketUrl, signallingUrl: socketUrl})).data
        res.redirect('/room/' + room.id)
    }catch (error) {
        res.status(500).send(error)
    }
})

router.get("/:roomId", async (req,res) => {

    let roomId = req.params.roomId

    try {
        roomInfo = (await axios.get(roomManagerUrl + '/rooms/' + roomId)).data

        res.cookie('roomId', roomId);

        res.cookie('socketUrl', roomInfo.socketUrl);
        res.cookie('signallingUrl', roomInfo.signallingUrl);
        
        res.sendFile(__dirname + "/public/html/room.html")
    } catch (error) {
        res.status(404).send('Room not found.')
        console.log(error)
    }
})

http.listen("3000", () => {
    console.log("Yggdrasil is up!")
})