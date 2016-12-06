var myPeerId = 'performer';
var peerNet = {
    host: 'liveweb.itp.io',
    port: 9000,
    path: '/'
};
var peer = null;
var peer_connections = [];

var videoElement;
var streamCanvas;
var streamCtx;
var streamCanvasData = null;

window.addEventListener('load', initpeer);

//???????
//dose it only happens once????
function initpeer() {
    peer = new Peer(myPeerId, peerNet);
    peer.on('error', function(err) {
        console.log(err);
    });

    //???????????
    //why would i need a new ID? already had one?
    peer.on('open', function(id) {
        console.log('performer_my peer id is: ' + id);
        initWebCam();
        // myPeerId = id;
    });

    peer.on('connection', function(conn) {
        connection = conn;
        console.log("Got a new peer " + connection.peer);
        peer_connections.push(connection);

        //every time a new peer connects, triggers an event for the client for sending following data
        connection.on('open', function() {
            //performer side starts to send out live stream data
            console.log("Opened a connection");
            // sendToPeer('livestream', streamCanvasData);
        });


        //??????????????
        //receive data from clients
        //after the client get a "ready" signal, it will send data back
        //???? imagine it is sending the image data back
        //   connection.on('data',function(dataReceived){
        //     console.log('data from client is : ' + dataReceived);
        //   });
    });

    peer.on('close', function() {
        console.log('Peer connection closed');
    });
}


function initWebCam() {
    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    var video = document.getElementById('thevideo');
    if (navigator.getUserMedia) {
        navigator.getUserMedia({
            video: true
        }, handleVideo, videoErr);
    }
}

//!!!!
//how to send frame by frame
//1. draw webcam to a canvas
//2.
//set image data, createImageData
//the second number is the quality of the image
// outputCanvasData = outputCanvas.toDataURL("image/" + imageType, 0.92); outputCanvasData = outputCanvas.toDataURL("image/jpeg", 0.92);

//this should only happen once
var handleVideo = function(stream) {

    videoElement = document.getElementById('thevideo');
    videoElement.src = window.URL.createObjectURL(stream) || stream;
    videoElement.play();

    streamCanvas = document.getElementById('streamCanvas');
    streamCtx = streamCanvas.getContext('2d');

    drawLiveStream();
}

function drawLiveStream() {
    videoElement = document.getElementById('thevideo');
    //chop video into canvas image data
    streamCtx.drawImage(videoElement, 0, 0, videoElement.width, videoElement.height);
    streamCanvasData = streamCanvas.toDataURL("image/jpeg", 0.50);
    // console.log("streamCanvasData: " + streamCanvasData);
    if (peer_connections.length > 0) {
      // console.log("Performer sending data");
      sendToPeer(streamCanvasData);
    }
    requestAnimationFrame(drawLiveStream);
}

var videoErr = function(err) {
    console.log('Failed to get local stream', err);
}


function sendToPeer(dataToSend) {
    peer_connections.forEach(function(connection) {
        connection.send(dataToSend);
    });
}



////////////// socket ////////////////////
var socket = io.connect();
socket.on('connect', function() {
    console.log("Performer connected to socket");
    socket.emit('newId', socket.id);
});


//receive history video files from the server, to show in the videos pool
socket.on('history', function(data) {
    var textData = String.fromCharCode.apply(null, new Uint8Array(data));
    // console.log(textData);
    document.getElementById('allVideos').innerHTML = " ";
    document.getElementById('allVideos').innerHTML += textData;
});

//receive client side gets a new video link
socket.on('newVideo', function(data) {
    document.getElementById('onlineVideo').innerHTML = data;
});
