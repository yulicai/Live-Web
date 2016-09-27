// HTTP Portion
var http = require('http'); //module
var fs = require('fs'); // Using the filesystem module
var httpServer = http.createServer(requestHandler); //creates server using "requestHandler" function
var url = require('url');
httpServer.listen(8080); //specifies port listening on

function requestHandler(req, res) {

	var parsedUrl = url.parse(req.url);
	console.log("The Request is: " + parsedUrl.pathname);

	fs.readFile(__dirname + parsedUrl.pathname, 
		// Callback function for reading
		function (err, data) {
			// if there is an error
			if (err) {
				res.writeHead(500);
				return res.end('Error loading ' + parsedUrl.pathname);
			}
			// Otherwise, send the data, the contents of the file
			res.writeHead(200);
			res.end(data);//data from the file
  		}
  	);
}



// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(httpServer);


// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 
	// We are given a websocket object in our function
	function (socket) {
    
    console.log("We have a new client: " + socket.id);
        
		socket.on('chatmessage', function(data, message, userName, id, target) {
			if (message == "close"){
                socket.emit('closeWindow')
                //socket.disconnect();
                //io.sockets.emit('closeWindow');
            }
            else{
            var target1 = target;
                // Data comes in as whatever was sent, including objects
			console.log("Received: 'chatmessage' " + data + " from " + id + " using username: " + userName);
			
			// Send it to all of the clients
            //socket.broadcast.emit('chatmessage', data);
            var senderName = userName;
			io.sockets.emit('chatmessage', data, message, senderName, id, target1);
            }
		});    
    
        socket.on('boot', function(){
           socket.disconnect(); 
        });
    
        socket.on('close', function(){
           socket.emit('closeWindow') 
        });
    
		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
		});
	}
);
