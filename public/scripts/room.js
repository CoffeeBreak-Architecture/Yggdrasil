const onLoggedIn = new Event('onLoggedIn')

var socket;
var localUserId;

var roomServerUrl = getCookie("socketUrl");

var canvas;
var ctx;

var connectedUsers = [];
var messages = []

var nearby = []
var threshold = 512
var room;

roomio = io(roomServerUrl + "/rooms", {
    reconnection: true,
    reconnectionDelay: 500
})

function addUser (user) {
    connectedUsers.push(user);
}

function removeUser (userId) {
    connectedUsers = connectedUsers.filter(x => x.id != userId)
}

roomio.on('connect', () => {
    let nickname = prompt("What's your name, sailor?")
    let nicknameAmalgamation = nickname + ":" + getCookie('roomId')
    roomio.emit('login', nicknameAmalgamation)
})

roomio.on('onLoggedIn', members => {
    console.log ("We've been accepted!");
    console.log(members)

    connectedUsers = members.all.filter(x => x.id != members.self.id)
    localUserId = members.self.id
    room = members.room
    document.title = room.name

    document.dispatchEvent(onLoggedIn)
})

roomio.on("onUserConnected", function(user) {
    addUser(user);
    drawMemberList();
});

roomio.on('onUserDisconnected', userId => {
    removeUser(userId)
    drawMemberList();
})

roomio.on("onMovePlayer", function(movement) {
    moveUser(movement.id, movement.x, movement.y);
    resetGain(movement.id)
})

roomio.on("onChatMessage", function(message) {
    addChatMessage(message.author, message.content);
    drawChatBox();
})

roomio.on("onNameChanged", function(change) {
    let user = getUserById(change.id);
    user.nickname = change.name;
    drawMemberList();
})

roomio.on('nearby', async data => {
    nearby = data.nearby
    threshold = data.threshold
    console.log("test")
    await callNearby(data.nearby)
})

function getNearbyById(id) {
    return nearby.find(x => x.id == id)
}

function getUserById (id) {
    return connectedUsers.find (element => element.id == id);
}

function getLocalUser () {
    return getUserById (localUserId);
}

function modifyLocalUserName (name) {
    roomio.emit("onNameChanged", name);
}

// ---- MEMBER LIST ----
function drawMemberList () {
    let memberlist = document.getElementById("memberlist");
    let innerHtml = "";
    connectedUsers.forEach(m => innerHtml += getMemberHtml(m));
    memberlist.innerHTML = innerHtml;
}

function getMemberHtml (user) {
    let ownerSuffix = room.ownerId == user.id ? " ????" : "";
    let localSuffix = user.id == localUserId ? " ??????" : "";
    let videoSuffix = user.hasVideo ? " ????" : "";
    let audioSuffix = user.hasAudio ? " ????" : "";
    return "<p style=\"color: " + user.color + "\"><strong>" + user.nickname + "</strong>" + localSuffix + audioSuffix + videoSuffix + ownerSuffix; // This is horrible :D
}

// ---- CHATBOX ----
function addChatMessage (author, contents) {
    messages.push({author: author, contents: contents});
}

function drawChatBox () {
    let chatbox = document.getElementById("chatbox")
    let innerHtml = "";
    messages.forEach(m => innerHtml += getMessageHtml(m.author, m.contents));
    chatbox.innerHTML = innerHtml;
    chatbox.scrollTop = chatbox.scrollHeight
}

function getMessageHtml (author, contents) {
    return "<p><strong>" + author + "</strong>: " + contents + "</p>"; // TODO: Add CSS
}

function sendChatMessage () {
    let input = document.getElementById("messageinput");

    if (input.value != "") {
        transmitChatMessage(getLocalUser().nickname, input.value)
        input.value = "";
    }
}

function transmitChatMessage(author, content) {
    let message = { author: author, content: content };
    roomio.emit("onChatMessage", message);
}

function moveLocalUser (x, y) {
    roomio.emit("onMovePlayer", {x: x, y: y});
    resetAllGains()
}

function moveUser (id, x, y) {
    let player = getUserById(id);
    player.x = x;
    player.y = y;
}