function initCanvas () {
    canvas.addEventListener('click', onCanvasClick, false)
}

function renderCanvas () {
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    connectedUsers.forEach(p => renderPerson(p.id, p.x, p.y, p.nickname, p.color));
    requestAnimationFrame(renderCanvas)
}

function renderPerson (id, x, y, name, color) {
    ctx.font = "16px Arial";
    ctx.strokeText(name, x - ctx.measureText(name).width / 2, y + 50);
    if (!renderWebcamStream(id, x, y)) {
        drawStickFigure(x, y, color);
    }
}

function renderWebcamStream (id, x, y) {
    let videoStream = streams[id]
    if (videoStream && videoStream.video) {
        aspectRatio = videoStream.video.videoWidth / videoStream.video.videoHeight
        ctx.drawImage(videoStream.video, x - 32 * aspectRatio, y - 24, 64 * aspectRatio, 64)
        return true
    }
    return false;
}

function drawStickFigure (x, y, color) {
    drawLine(x, y, x, y + 20, color);
    drawLine(x, y + 20, x + 10, y + 30, color);
    drawLine(x, y + 20, x - 10, y + 30, color);
    drawLine(x, y, x + 10, y + 10, color);
    drawLine(x, y, x - 10, y + 10, color);
    drawCircle(x, y - 7, 7, color);
}

function drawLine (sx, sy, ex, ey, color) {
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
}

function drawCircle(x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.closePath();
    ctx.stroke()
}

function onCanvasClick (e) {
    let canvasRect = canvas.getBoundingClientRect();

    let clientWidth = $(window).width()
    let clientHeight = $(window).height();

    let canvasWidth = canvasRect.right - canvasRect.left;
    let canvasHeight = canvasRect.bottom - canvasRect.top;

    let xFactor = clientWidth / canvasWidth;
    let yFactor = clientHeight / canvasHeight; 

    var canvasX = Math.round((e.clientX - canvasRect.left) * xFactor);
    var canvasY = Math.round((e.clientY - canvasRect.top) * yFactor);
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // (0,0) the top left of the canvas

    moveLocalUser(canvasX, canvasY);
    unmuteAll()
}