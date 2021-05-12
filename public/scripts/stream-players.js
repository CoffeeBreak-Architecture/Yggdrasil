let audioCtx = new AudioContext()
const videoGrid = document.getElementById('streamlist')
const streams = {}

const videoConstraints = {
    video: true,
    audio: true
}

var localStream

async function getLocalStream() {
    if (localStream != undefined) {
        return localStream
    }

    return new Promise((resolve, reject) => {
        navigator.mediaDevices.getUserMedia(videoConstraints).then(stream => {
            makeStreamElement(localUserId)
            audioStream = new MediaStream(stream.getAudioTracks());
            videoStream = new MediaStream(stream.getVideoTracks());

            localStream = stream;
            console.log('Local stream is set up.')

            addVideoStreamToDocument(localUserId, videoStream)
            //addAudioStreamToDocument(localUserId, audioStream)
            resolve(localStream);
        }).catch(error => {
            console.error('No video device avalable.', error)
            localStream = stream
            console.log('Local stream is set up.')

            addAudioStreamToDocument(localUserId, audioStream)
        })
    }).catch(error => {
        console.error('No input device avalable at all :(', error)
        reject();
    })
}

function unmuteAll(){
    audioCtx.resume();
}

function addStreamToDocument(userId, stream) {
    makeStreamElement(userId)
    addVideoStreamToDocument(userId, stream)
    addAudioStreamToDocument(userId, stream)
}

function addVideoStreamToDocument(userId, stream) {

    let video = document.createElement('video')
    video.srcObject = stream
    video.play()
    video.muted = true;
    console.log("Creates stream")
    streams[userId].video = video
    streams[userId].videoStream = stream
    videoGrid.appendChild(video)
}

function addAudioStreamToDocument(userId, audioStream) {
    
    let gainNode = audioCtx.createGain()
    let sourceNode = audioCtx.createMediaStreamSource(audioStream)

    sourceNode.connect(gainNode)
    gainNode.connect(audioCtx.destination)
    gainNode.gain.value = computeGain(userId);

    // This should probably be a class.
    // Source and destination nodes are never accessed outside this function, but I don't trust garbage collection and I'm unfamiliar with how JavaScript stream are disposed.
    streams[userId].audioStream = audioStream
    streams[userId].sourceNode = sourceNode
    streams[userId].gainNode = gainNode
    streams[userId].audioContext = audioCtx
}

function makeStreamElement(userId) {
    if (streams[userId] == undefined) {
        streams[userId] = {}
    }
}

function removeStreamFromDocument(userId) {
    video = streams[userId].video
    if (video != undefined) {
        video.remove()
    }
    delete streams[userId]
}

// Splits one MediaStream with audio and video into two streams with it's constitute parts
function splitSimpleStream(stream) {
    let audioStream = undefined
    let videoStream = undefined
    if (stream.getAudioTracks().length == 1) {
        audioStream = new MediaStream(stream.getAudioTracks()[0])
    }
    if (stream.getVideoTracks().length == 1) {
        videoStream = new MediaStream(stream.getVideoTracks()[0])
    }
    return { audio: audioStream, video: videoStream }
}

function setGain(id, value) {
    if (streams[id] != undefined && streams[id].gainNode != undefined) {
        streams[id].gainNode.gain.setValueAtTime(value, audioCtx.currentTime)
    }else{
        console.log("Tried to modify a non-existing gain node.")
    }
}

function resetAllGains() {
    nearby.forEach(x => {
        resetGain(x.id)
    })
}

function resetGain (targetId) {
    let stream = streams[x.id]
    if (stream != undefined) {
        setGain(x.id, computeGain(x.id))
    }
}

function computeGain(targetId) {
    let n = getNearbyById(targetId)
    if (n != undefined) {
        let t = threshold
        let factor = 1 - (n.sqrDist / (t * t))
        return factor
    }
    return 1
}