var px, py, x, y;
var drawingmode;
var tempX = 0;
var tempY = 0;

var ctracker;
var video;

var videoCanvas;
var videoCtx;
var videoPreHoldCanvas, videoPreHoldCtx;
var resolution = 700; //don't adjust it to too high, it will affect the performance a lot 
var strokeWeight = 2;

function initVideo() {
    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    if (navigator.getUserMedia) {
        navigator.getUserMedia({ video: true }, init, videoError);
    }
}

function videoError(e) {
    console.log('Video-Errorrrrrrr- ' + e.code);
}

function init(stream) {
    /*
     * Drawing line part init
     */
    px = 0;
    py = 0;
    x = 0;
    y = 0;
    drawingmode = false;
    thecanvas = document.getElementById('thecanvas');
    thecontext = thecanvas.getContext('2d');
    receiveCanvas = document.getElementById('receiveCanvas');
    receiveContext = receiveCanvas.getContext('2d');
    thecontext.clearRect(0, 0, 1400, 800);
    receiveContext.clearRect(0, 0, 1400, 800);

    videoPreHoldCanvas = document.getElementById('videoPreHoldCanvas');
    videoPreHoldCtx = videoPreHoldCanvas.getContext("2d");
    videoCanvas = document.getElementById('videoCanvas');
    videoCtx = videoCanvas.getContext("2d");

    /*
     * Video part init
     */
    $("#videoElement")[0].src = window.URL.createObjectURL(stream);
    $("#videoElement")[0].play();
    ctracker = new clm.tracker();
    ctracker.init(pModel);
    ctracker.start(($("#videoElement")[0]));

    onRequestAnimation();
}

function onRequestAnimation() {
    /*
     * Video part init
     */
    video = document.getElementById('videoElement');

    videoPreHoldCtx.drawImage(video, 0, 0, video.width, video.height);
    var frame = videoPreHoldCtx.getImageData(0, 0, video.width, video.height);

    //init face tracking library ctracker
    var positions = ctracker.getCurrentPosition();
    var facePositions = [];

    //locate face element position and store them in an array
    if (positions.length > 0) {
        for (var a = 0; a < positions.length; a++) {
            facePositions[a] = {};
            facePositions[a].x = positions[a][0];
            facePositions[a].y = positions[a][1];
        }

        var oneFaceArray = []; //create an array to hold all the loc of one face area
        //go through pixels and grab their rgb
        for (var n = 0; n < resolution; n++) {
            //pick a random position
            var x = Math.floor(Math.random() * frame.width);
            var y = Math.floor(Math.random() * frame.height);
            var pixIndex = y * frame.width + x;
            var pixR = frame.data[pixIndex * 4 + 0];
            var pixG = frame.data[pixIndex * 4 + 1];
            var pixB = frame.data[pixIndex * 4 + 2];
            var oneFace = {};
            if (isFaceLoc(x, y, facePositions)) {
                // drawFace(videoCtx, x, y, pixR, pixG, pixB);
                oneFace.x = x;
                oneFace.y = y;
                oneFace.r = pixR;
                oneFace.g = pixG;
                oneFace.b = pixB;
                oneFaceArray.push(oneFace);

            }
        }

    }
    /*
     * Drawing line part init
     */
    thecanvas.addEventListener('mousedown',
        function() {
            px = tempX;
            py = tempY;
            drawingmode = true;
        });
    thecanvas.addEventListener('mouseup', function() {
        drawingmode = false;
    });
    thecanvas.addEventListener('mousemove', function(evt) {
        tempX = evt.clientX;
        tempY = evt.clientY;
    });

    //when you are drawing, send out all datas
    if (drawingmode) {
        x = tempX;
        y = tempY;
        thecontext.beginPath();
        thecontext.moveTo(px, py);
        thecontext.lineTo(x, y);
        thecontext.strokeStyle = '#FC4E03'
        thecontext.stroke();
        for (var i = 0; i < objects.length; i++) {
            if (socket.id == objects[i].id) {
                objects[i].px = px;
                objects[i].py = py;
                objects[i].x = x;
                objects[i].y = y;
                socket.emit('sendObject', objects[i]);
                socket.emit('sendFace', oneFaceArray, facePos[i]);
                break;
            }
        }
        px = x;
        py = y;

    }
    requestAnimationFrame(onRequestAnimation);
}

function drawFace(ctx, _x, _y, r, g, b) {
    ctx.save();
    ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
    ctx.strokeStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
    ctx.beginPath();
    ctx.lineWidth = 0.1;
    ctx.ellipse(_x, _y, strokeWeight, strokeWeight, 45 * Math.PI / 180, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
}

function isFaceLoc(_x, _y, face) {
    var faceCenterX = face[41].x;
    var faceCenterY = face[41].y;
    var rx = (Math.abs(face[12].x - face[37].x) * 2.0) / 2.0;
    var ry = (Math.abs(face[41].y - face[7].y) * 2.0) / 2.0;
    var cal = Math.pow((_x - faceCenterX) / rx, 2) + Math.pow((_y - faceCenterY) / ry, 2);
    if (cal < 1) return true;
    else return false;
}

window.addEventListener('load', initVideo);
