/*
 * youtube  <iframe width="560" height="315" src="https://www.youtube.com/embed/u9p4mrD1ni0" frameborder="0" allowfullscreen></iframe>
 * vimeo <iframe src="https://player.vimeo.com/video/74707281" width="640" height="360" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
 * bilibili <embed height="415" width="544" quality="high" allowfullscreen="true" type="application/x-shockwave-flash" src="http://static.hdslb.com/miniloader.swf" flashvars="aid=7326379&page=1" pluginspage="http://www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash"></embed>
 */

var peer = null;
var peerNet = {
    host: 'liveweb.itp.io',
    port: 9000,
    path: '/'
};
//connect to this id automatically
var peerId = 'performer';
var connection = null;

var userObjects = [];

//variable for storing last time a video was sent
var lastVideoTime = new Date();
//variable for defining how long is the submit button blodked
var blockingTime = 60000;

var socket = io.connect();
socket.on('connect', function() {
    console.log("Connected");
    socket.emit('newId', socket.id);
});


var clientInitPeer = function() {
    peer = new Peer(peerNet);

    peer.on('open', function(id) {
        console.log('My peer ID is: ' + id);
        connectToPerformer();
    });

    //????? two kinds of connection? one to peer server and ther other to the performer?
    peer.on('connection', function(connection) {
        connection.on('open', function() {
            console.log("Peer connected to peer server");
            // connectToPerformer();
        });
    });

    document.getElementById('showTime').style.visibility = "hidden";
}

function connectToPerformer() {
    connection = peer.connect(peerId);
    connection.on('open', function(data) {
        console.log("Connected to the performer");
    });
    connection.on('data', function(dataReceived) {
      document.getElementById('liveStreamHolder').src = dataReceived;
    });
    // requestAnimationFrame(connectToPerformer);
}

var addVideo = function(videoLink) {
    var stringVideo = String(videoLink);
    var thumbNail = String(videoLink);
    var widthN = stringVideo.indexOf("width");
    widthN = widthN + 7;
    var widthValue = stringVideo.slice(widthN, widthN + 3);
    var heightN = stringVideo.indexOf("height");
    heightN = heightN + 8;
    var heightValue = stringVideo.slice(heightN, heightN + 3);

    thumbNail = thumbNail.replace(widthValue, "320");
    thumbNail = thumbNail.replace(heightValue, "240");
    stringVideo = stringVideo.replace(widthValue, "800");
    stringVideo = stringVideo.replace(heightValue, "600");

    if (stringVideo.includes("https")) {
        //do nothing
    } else {
        stringVideo = stringVideo.replace(/http/g, "https");
        thumbNail = thumbNail.replace(/http/g, "https");
    }


    for (var i = 0; i < userObjects.length; i++) {
        if (socket.id == userObjects[i].id) {
            userObjects[i].videoLink = stringVideo;
            socket.emit('sendObject', userObjects[i]);
        }
    }
    if (stringVideo[0] == "<") {
      socket.emit('newVideo', stringVideo, thumbNail);
    }

}


var videoTimer = function() {
  var currentTime = new Date();
  socket.emit('timerStart', {});


}

socket.on('newId', function(data) {
    var unitObject = {
        id: data,
        videoLink: undefined
    }
    userObjects.push(unitObject);
});

//receive history video files from the server, to show in the videos pool
socket.on('history', function(data) {
    var textData = String.fromCharCode.apply(null, new Uint8Array(data));
    console.log(textData);
    document.getElementById('allVideos').innerHTML = "<h1>Passed videos pool</h1>";
    document.getElementById('allVideos').innerHTML += textData;
});


//receive client side gets a new video link
socket.on('newVideo', function(data) {
    document.getElementById('onlineVideo').innerHTML = data;
});

socket.on('timerStart',function(data){
  document.getElementById("submitVideo").disabled = true;
  document.getElementById('showTime').style.visibility = "visible";
  setTimeout(function() {
      document.getElementById("submitVideo").disabled = false;
      document.getElementById('showTime').style.visibility = "hidden";
  }, 60000);
});

// socket.on('allVideos', function(videos) {
//     for (var i = 0; i < videos.length; i++) {
//         document.getElementById('allVideos').innerHTML += videos[i];
//     }
// });


window.addEventListener('load', clientInitPeer);
