var https = require('https');
var fs = require('fs'); // Using the filesystem module
var url = require('url');

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

var httpServer = https.createServer(options, onRequest);
httpServer.listen(8082);

console.log("Server is running and waiting");

// WebSocket Portion
// WebSockets work with the HTTP server
var socketio = require('socket.io');
var io = socketio.listen(httpServer);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
    // We are given a websocket object in our function
    function(socket) {

        console.log("We have a new client: " + socket.id);


        socket.on('newId', function(data, name) {
            io.sockets.emit('newId', data, name);
        });

        socket.on('sendObject', function(data) {
            io.sockets.emit('sendObject', data);
        });

        socket.on('sendFace', function(data,facePosition) {
            io.sockets.emit('sendFace', data, facePosition);
        });

        socket.on('disconnect', function() {
            console.log("Client has disconnected");
        });
    }
);
