const signalling = io(getCookie('signallingUrl') + '/signalling')
//const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }
var config = {
    sdpSemantics: 'unified-plan'
};
let mediaSender = new RTCPeerConnection(config)
const peerConnections = {}
//Peer connection
//Just for testing, absolutely not the correct solution

async function callNearby(nearby) {
    for (const pc in peerConnections) {
        const target = peerConnections[pc].target
        if (hasActiveCall(target)) {
            inNearby = nearby.find(x => x.id == target)
            if (inNearby == undefined) {
                closeCall(target)
                sendMessage("close", target)
            }
        }
    }

    let promises = []
    nearby.forEach(x => {
        if (!hasActiveCall(x.id)) {
            promises.push(makeCall(x.id))
            sendMessage("connect", x.id)
        }
    })

    await (Promise.all(promises))
}

async function callBack(target) {
    if (!hasActiveCall(target)) {
        await makeCall(target)
    }
}

async function makeCall(clientId) {
    console.log('Calling ' + clientId)
    if (peerConnections[clientId] == undefined) {
        await createListenerPeerConnection(clientId);
    }
    return sendOffer(peerConnections[clientId].pc, "listener", clientId)

}

document.addEventListener('onLoggedIn', () => {
    signalling.emit('login', localUserId)
    createMediaSender(mediaSender);
})

async function createMediaSender(pc) {
    stream = await getLocalStream();
    stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream)
    })
    return sendOffer(pc, "offer", localUserId);
}

function sendOffer(pc, connectionType, userTarget) {
    return pc.createOffer().then(function (offer) {
        return pc.setLocalDescription(offer);
    }).then(function () {
        // wait for ICE gathering to complete
        return new Promise(function (resolve) {
            if (pc.iceGatheringState === 'complete') {
                resolve();
            } else {
                function checkState() {
                    if (pc.iceGatheringState === 'complete') {
                        pc.removeEventListener('icegatheringstatechange', checkState);
                        resolve();
                    }
                }
                pc.addEventListener('icegatheringstatechange', checkState);
            }
        });
    }).then(function () {
        var offer = pc.localDescription;


        return fetch('http://localhost/' + connectionType, {
            body: JSON.stringify({
                sdp: offer.sdp,
                type: offer.type,
                video_transform: "none",
                name: userTarget
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST'
        });
    }).then(function (response) {
        return response.json();
    }).then(function (answer) {
        return pc.setRemoteDescription(answer);
    }).catch(function (e) {
        alert(e);
    });
}

signalling.on('message', async function (message) {
    if (message.message === 'connect') {
        callBack(message.from)
    }
    else if (message.message === 'close') {
        closeCallConnection(message.from)
    }
});

function sendMessage(message, target) {
    //console.log('Client sending message: ', message);
    signalling.emit('message', { to: target, from: localUserId, message: message })
}

// function sendMessage(message, target) {
//     //console.log('Client sending message: ', message);
//     signalling.emit('message', { to: target, from: localUserId, message: message })
// }

async function createListenerPeerConnection(targetID) {
    try {
        peerConnections[targetID] = { pc: new RTCPeerConnection(config), target: targetID }
        peerConnections[targetID].pc.ontrack = event => handleRemoteTrackAdded(event, targetID);
        peerConnections[targetID].pc.onremovestream = handleRemoteStreamRemoved;
        peerConnections[targetID].pc.onconnectionstatechange = event => stateChangeHandler(event, targetID)
        let silence = () => {
            let ctx = new AudioContext(), oscillator = ctx.createOscillator();
            let dst = oscillator.connect(ctx.createMediaStreamDestination());
            oscillator.start();
            return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
        }

        let black = ({ width = 640, height = 480 } = {}) => {
            let canvas = Object.assign(document.createElement("canvas"), { width, height });
            canvas.getContext('2d').fillRect(0, 0, width, height);
            let stream = canvas.captureStream();
            return Object.assign(stream.getVideoTracks()[0], { enabled: false });
        }
        let constraints2 = { width: 640, height: 480 };
        let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
        peerConnections[targetID].pc.addStream(blackSilence(constraints2))
        console.log('Created RTCPeerConnnection');
    } catch (e) {
        console.error('Failed to create PeerConnection', e);
        alert('Cannot create RTCPeerConnection object.');
        return;
    }
}

// function handleIceCandidate(event, targetID) {
//     //console.log('icecandidate event: ', event);
//     if (event.candidate) {
//         sendMessage({
//             type: 'candidate',
//             label: event.candidate.sdpMLineIndex,
//             id: event.candidate.sdpMid,
//             candidate: event.candidate.candidate
//         }, targetID);

//     } else {
//         console.log('End of candidates.');
//     }
// }

function handleRemoteTrackAdded(event, targetID) {
    //console.log("START OF REMOTE STREAM EVENT")
    console.log(event)
    if (event.track.kind == 'video') {
        addVideoStreamToDocument(targetID, event.streams[0])
        console.log("video")
    }
    else {
        addAudioStreamToDocument(targetID, event.streams[0])
        console.log("audio")
    }
}

function handleRemoteStreamRemoved(event) {
    console.log('Remote stream removed. Event: ', event);
}

// //Function to set description of local media
// function setLocalAndSendMessage(sessionDescription, target) {
//     peerConnections[target].pc.setLocalDescription(sessionDescription);
//     console.log('setLocalAndSendMessage sending message', sessionDescription);
//     sendMessage(sessionDescription, target);
// }

// function answerCall(target) {
//     console.log('Sending answer to peer.');
//     peerConnections[target].pc.createAnswer().then((sessionDescription) => {
//         setLocalAndSendMessage(sessionDescription, target)
//     }, (error) => {
//         console.error(error)
//     });
// }

function closeCallConnection(target) {
    console.log('Closing call with ' + target)
    peerConnections[target].pc.close();
    delete peerConnections[target];
    removeStreamFromDocument(target)
}

function closeCall(target) {
    closeCallConnection(target)
    sendMessage({ type: 'close' }, target)
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
    if (connectState === "disconnected" || connectState === "failed") {
        closeCall(target)
    }
}
