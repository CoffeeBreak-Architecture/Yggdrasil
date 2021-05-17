const signalling = io(getCookie('signallingUrl'))
const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}

signalling.on('onSelfConnectedToStreamServer', () => {
    signalling.emit('selfReportId', localUserId)
})

const pcs = []
signalling.on('offerCall', async message => {
    if (message.type == 'offer') {
        let peerConnection = new RTCPeerConnection(configuration)
        peerConnection.setRemoteDescription(new RTCSessionDescription(message));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        pcs.push(peerConnection)
        signalling.emit('answerCall', answer);

        peerConnection.addEventListener('connectionstatechange', event => {
            console.log(peerConnection.connectionState)
            if (peerConnection.connectionState === 'connected') {
                // Peers connected!
            }
        });
    }
});


function getWebcamStream () {
    
}

function getMicrophoneStream () {

}

// THIS FILE IS NOT IN USE.
// PLEASE DON'T JUDGE IT'S AWFULNESS