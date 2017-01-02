var http = require("http");
var server = http.createServer(function (request, response) {

})

server.listen(1234, function() {
	console.log((new Date()) + " Server is listening on port 1234.");
});

var WebSocketServer = require("websocket").server;

var wsServer = new WebSocketServer({
	httpServer: server
});

var count = 0;
var clients = {};


// only runs when a request occurs
wsServer.on("request", function(r) {
	var connection = r.accept("echo-protocol", r.origin);

	var id = count++;
	clients[id] = connection;

	// tell client his id
	clients[id].sendUTF("*id," + id);

	console.log((new Date()) + " Connection accepted [" + id + "]");

	// recieved  data
	connection.on("message", function(message) {
		var messageData = JSON.stringify(message.data);
		// send message back to each client
		for (var i in clients) {
				clients[i].sendUTF(message.utf8Data);
			
		}
	});

	connection.on("close", function(reasonCode, description) {
		delete clients[id];
		console.log((new Date()) +" Peer " + connection.remoteAddress + " disconnected.");
	})
	console.log(count);
});