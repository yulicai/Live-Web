//require modules
var https = require('https');
var fs = require('fs'); // Using the filesystem module
var url = require('url');

//variables for storing the initialization moment
var initDate = new Date();
var initYear = initDate.getFullYear();
var initMonth = initDate.getMonth();
var initDay = initDate.getDay();
var initHour = initDate.getHours();
var initMinute = initDate.getMinutes();
var initSecond = initDate.getSeconds();

//timestamp for writing file
var timestamp = initYear + "_" + initMonth + "_" + initDay +  "_" +
initHour + "_" + initMinute + "_" + initSecond + "_";

//filenames of logs
var videolog = "videolog.txt"
var chatlog = "chatlog.txt";
var logFileDescriptor;

// var videologFilename = timestamp + videolog;

//open file for videolog
fs.open(videolog, 'a', function(err, fd) {
    if (err) {
    	console.log(err);
    }
    logFileDescriptor = fd;
});


function writeVideoLinkToFile(videoLink){
  var date = new Date();
  // videoLink = date.toString() + videoLink;
  var buffer = new Buffer(videoLink + '\n');
  fs.write(logFileDescriptor,buffer,0,buffer.length,null,function(err){
    if(err) throw 'error writing file; '+ err;
  })
}

// fs.writeFile(videolog, dummy1, function (err) {
//   if (err) throw err;
//   console.log('It\'s saved!');
// });


var options = {
    key: fs.readFileSync('my-key.pem'),
    cert: fs.readFileSync('my-cert.pem')
};

function onRequest(req, res) {
    //console.log(req);

    var parsedUrl = url.parse(req.url);
    console.log("The Request is: " + parsedUrl.pathname);

    // res.writeHead(200, {'Content-Type': 'text/plain'});
    // res.end('You Requested ' + parsedUrl.pathname);


  if (req.url.indexOf('.css') != -1) {
      // Read in the file they requested
      fs.readFile(__dirname + parsedUrl.pathname,
          // Callback function, called when reading is complete
          function(err, data) {
              // if there is an error
              if (err) {
                  res.writeHead(500);
                  return res.end('Error loading ' + parsedUrl.pathname);
              }
              // res.writeHead(200, { 'Content-Type': 'text/plain' });
              //end means ending the connection
              // res.end("hello world/n");

              // Otherwise, send the data, the contents of the file
              res.writeHead(200, {'Content-Type': 'text/css'});
              res.end(data);
          }
      );

    }  else {
      // Read in the file they requested
      fs.readFile(__dirname + parsedUrl.pathname,
          // Callback function, called when reading is complete
          function(err, data) {
              // if there is an error
              if (err) {
                  res.writeHead(500);
                  return res.end('Error loading ' + parsedUrl.pathname);
              }
              // res.writeHead(200, { 'Content-Type': 'text/plain' });
              //end means ending the connection
              // res.end("hello world/n");

              // Otherwise, send the data, the contents of the file
              res.writeHead(200);
              res.end(data);
          }
      );
    }




}

var httpServer = https.createServer(options, onRequest);
httpServer.listen(8055);

console.log("Server is running and waiting on 8055");

// WebSocket Portion
// WebSockets work with the HTTP server
var socketio = require('socket.io');
var io = socketio.listen(httpServer);

var videoLinks = [];


// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
    // We are given a websocket object in our function
    function(socket) {

      // Read in the file they requested
      fs.readFile(__dirname + "/videolog.txt",
          // Callback function, called when reading is complete
          function(err, data) {
              // if there is an error
                if(err) throw err;
                else{
                  // console.log("logfile: " + data);
                  io.sockets.emit('history',data);
                }
          }
      );

        console.log("We have a new client: " + socket.id);

        socket.on('newId', function(data) {
            io.sockets.emit('newId', data);
        });



        socket.on('newVideo',function(bigVideo, thumbNail){
          videoLinks.push(thumbNail);
          writeVideoLinkToFile(thumbNail);
          io.sockets.emit('allVideos', videoLinks);
          io.sockets.emit('newVideo', bigVideo);
        });

        socket.on('timerStart',function(data){
          io.sockets.emit('timerStart', data);
        });

        socket.on('sendObject',function(data){
          // console.log(data);
        });

        socket.on('disconnect', function() {
            console.log("Client has disconnected");
        });
    }
);
