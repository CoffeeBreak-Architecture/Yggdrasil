const signalling = io(getCookie('signallingUrl') + '/signalling', {
    reconnection: true,
    reconnectionDelay: 500
})
const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }

//All connected users in the room
const peerConnections = {}
//Checks all users in a room. If nearby start call
async function callNearby(nearby) {
    for (const pc in peerConnections) {
        const target = peerConnections[pc].target
        if (hasActiveCall(target)) {
            inNearby = nearby.find(x => x.id == target)

            if (inNearby == undefined) {
                closeCall(target)
            }
        }
    }

    let promises = []
    nearby.forEach(x => {
        if (!hasActiveCall(x.id)) {
            promises.push(makeCall(x.id))
        }
    })
    
    await (Promise.all(promises))
}

//Initializes the WebRTC connection
async function makeCall(clientId) {
    console.log('Calling ' + clientId)
    if(peerConnections[clientId] == undefined) {
        await createPeerConnection(clientId);
    }
    peerConnections[clientId].pc.createOffer((sessionDescription) => {
        setLocalAndSendMessage(sessionDescription, clientId)
    }, (event) => {
        console.error("error")
    })
}


document.addEventListener('onLoggedIn', () => {
    signalling.emit('login', localUserId)
})

//Handles signalling
signalling.on('message', async function (message) {
    //console.log('Client received message:', message);
    if (message.message.type === 'offer') {
        if(peerConnections[message.from] == undefined) {
            await createPeerConnection(message.from);
        }
        peerConnections[message.from].pc.setRemoteDescription(new RTCSessionDescription(message.message));

        answerCall(message.from)
    } else if (message.message.type === 'answer') {
        peerConnections[message.from].pc.setRemoteDescription(new RTCSessionDescription(message.message));

        console.log("Answer Recieved")
    } else if (message.message.type === 'candidate') {
        var candidate = new RTCIceCandidate({
            sdpMLineIndex: message.message.label,
            candidate: message.message.candidate
        });
        peerConnections[message.from].pc.addIceCandidate(candidate);
    }else if (message.message.type === 'close') {
        closeCallConnection(message.from)
    }
});

function sendMessage(message, target) {
    //console.log('Client sending message: ', message);
    signalling.emit('message', { to: target, from: localUserId, message: message })
}

//Sets up the peer connection
async function createPeerConnection(targetID) {
    try {
        peerConnections[targetID] = { pc: new RTCPeerConnection(configuration), target: targetID }
        peerConnections[targetID].pc.onicecandidate = event => handleIceCandidate(event, targetID);
        peerConnections[targetID].pc.onaddstream = event => handleRemoteStreamAdded(event, targetID);
        peerConnections[targetID].pc.onremovestream = handleRemoteStreamRemoved;
        peerConnections[targetID].pc.onconnectionstatechange = event => stateChangeHandler(event, targetID)
        //Gets the local stream from the stream-players.js script
        peerConnections[targetID].pc.addStream(await getLocalStream())
        console.log('Created RTCPeerConnnection');
    } catch (e) {
        console.error('Failed to create PeerConnection', e);
        alert('Cannot create RTCPeerConnection object.');
        return;
    }
}

//When a ICE candidate is recieved pc.onicecandidate event listener fires this function. Sends the
//received candiate to all other users in the room.
function handleIceCandidate(event, targetID) {
    if (event.candidate) {
        sendMessage({
            type: 'candidate',
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate
        }, targetID);

    } else {
        console.log('End of candidates.');
    }
}

function handleRemoteStreamAdded(event, targetID) {
    remoteStream = event.stream;
    console.log(event)
    //Adds the stream to the browser window, from stream-players.js script
    addStreamToDocument(targetID, remoteStream)
}

function handleRemoteStreamRemoved(event) {
    console.log('Remote stream removed. Event: ', event);
}

//Function to set description of local media
function setLocalAndSendMessage(sessionDescription, target) {
    peerConnections[target].pc.setLocalDescription(sessionDescription);
    console.log('setLocalAndSendMessage sending message', sessionDescription);
    sendMessage(sessionDescription, target);
}

function answerCall(target) {
    console.log('Sending answer to peer.');
    peerConnections[target].pc.createAnswer().then((sessionDescription) => {
        setLocalAndSendMessage(sessionDescription, target)
    }, (error) => {
        console.error(error)
    });
}

function closeCallConnection (target) {
    console.log('Closing call with ' + target)
    peerConnections[target].pc.close();
    delete peerConnections[target];
    removeStreamFromDocument(target)
}

function closeCall(target){
    closeCallConnection(target)
    sendMessage({type: 'close'}, target)
}

function getConnectionState(targetId) {
    if (peerConnections[targetId] != undefined) {
        return peerConnections[targetId].pc.connectionState;
    }
    return undefined;
}

function hasActiveCall(targetId) {
    let cstate = getConnectionState(targetId)
    return (cstate == 'new' || cstate == 'connecting' || cstate == 'connected')
}

function stateChangeHandler(event, target) {
    let connectState = event.srcElement.connectionState
    if(connectState === "disconnected" || connectState === "failed"){
        closeCall(target)
    }
}
