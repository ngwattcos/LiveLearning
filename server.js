var http = require("http");
var queryString = require("querystring");

var server = http.createServer(function (request, response) {
	var queryData = url.parse(request.url, true).query;
	response.writeHead(200, {"Content-Type": "text/plain"});
	console.log("adfasd");

	if (queryData.name) {
		// user told us their name in the GET request, ex: http://host:8000/?name=Tom
		response.end('Hello ' + queryData.name + '\n');

	} else {
		response.end("Hello World\n");
	}
});

server.listen(1234, function() {
	console.log((new Date()) + " Server is listening on port 1234.");
});

var WebSocketServer = require("websocket").server;

var wsServer = new WebSocketServer({
	httpServer: server
});

var count = 0;
var clients = {};

var classrooms = [];


// only runs when a request occurs
wsServer.on("request", function(request) {
	var connection = request.accept("echo-protocol", request.origin);

	var id = count++;
	clients[id] = connection;

	// tell client his id
	clients[id].sendUTF("*id," + id);

	console.log((new Date()) + " Connection accepted [" + id + "]");

	// recieved  data
	connection.on("message", function(message) {

		if (message.type == "utf8") {
			var messageData = JSON.parse(message.utf8Data);
			// console.log(messageData.sender);

			// send message back to each client
			for (var i in clients) {
					clients[i].sendUTF(message.utf8Data);
				
			}
		} else if (message.type == "binary") {
			console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
			connection.sendBytes(message.binaryData);
		}
		
	});

	connection.on("close", function(reasonCode, description) {
		delete clients[id];
		console.log((new Date()) +" Peer " + connection.remoteAddress + " disconnected.");
	});
	console.log(count);
});