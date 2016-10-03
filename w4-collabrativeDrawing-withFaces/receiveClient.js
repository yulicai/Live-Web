var thecontext;
var thecanvas;
var receiveCanvas;
var receiveContext;

var objects = [];
var userName;
var facePos = [];

var socket = io.connect();
socket.on('connect', function() {
    console.log("Connected");
    userName = prompt("Who are you? ");
    socket.emit('newId', socket.id, userName);
});


socket.on('newId', function(id, name) {
    var unicObject = {
        x: Math.random() * 1000,
        y: Math.random() * 800,
        px: 100,
        py: 300,
        id: id,
        r: Math.floor(Math.random() * 255),
        g: Math.floor(Math.random() * 255),
        b: Math.floor(Math.random() * 255),
        name: name
    }
    var faceObject = {
        randomPosX: Math.ceil(Math.random() * 1000),
        randomPosY: Math.ceil(Math.random() * 600),
        id: id
    }
    objects.push(unicObject);
    facePos.push(faceObject);
    console.log('Objects Number: ' + objects.length);
});


socket.on('sendObject', function(drawingdata) {
    var rPx = 0;
    var rPy = 0;
    receiveContext.font = "16px Helvetica";
    receiveContext.fillStyle = 'rgb(' + drawingdata.r + ',' + drawingdata.g + ',' + drawingdata.b + ')';
    receiveContext.fillText(drawingdata.name, drawingdata.px + 5, drawingdata.py);
    receiveContext.beginPath();
    receiveContext.moveTo(drawingdata.px, drawingdata.py);
    receiveContext.lineTo(drawingdata.x, drawingdata.y);
    receiveContext.lineWidth = 6;
    receiveContext.strokeStyle = 'rgb(' + drawingdata.r + ',' + drawingdata.g + ',' + drawingdata.b + ')';
    receiveContext.stroke();
    rPx = drawingdata.x;
    rPy = drawingdata.y;

});

//Receiving face data
socket.on('sendFace', function(theArray, faceP) {
    for (var i = 0; i < theArray.length; i++) {
        drawFace(videoCtx, theArray[i].x + faceP.randomPosX, theArray[i].y + faceP.randomPosY, theArray[i].r, theArray[i].g, theArray[i].b)
    }
});



