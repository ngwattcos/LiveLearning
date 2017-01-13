// var ws = new WebSocket("ws://127.0.0.1:1234", "echo-protocol");
// ip address of Raghav's computer
var ws = new WebSocket("ws://10.122.22.46:1234", "echo-protocol");

var registered = false;
var client = {};

var canvas = document.getElementById("canvas");

// send strokes to the server
canvas.addEventListener("mouseup", function() {
	if (client.id != undefined) {
		var message = new Message("stroke+", client.id, strokes[strokeNum]);

		var thisStroke = {
			name: "shared0",
			stroke: strokes[strokeNum]
		};

		ws.send(JSON.stringify(message));
		Materialize.toast("Brush stroke sent.", 1000);
	}
	
});

undo.addEventListener("click", function() {
	if (client.id != undefined) {
		var message = new Message(".", client.id, "");
		ws.send(JSON.stringify(message));
	}
});

redo.addEventListener("click", function() {
	if (client.id != undefined) {
		var message = new Message("+", client.id, "");
		ws.send(JSON.stringify(message));
	}
});

clear.addEventListener("click", function() {
	if (client.id != undefined) {
		var message = new Message("..", client.id, "");
		ws.send(JSON.stringify(message));
	}
});

var synchronize = document.getElementById("synchronize");

synchronize.addEventListener("click", function() {
	if (client.id != undefined) {
		var message = new Message("++", client.id, [strokes, futureStrokes]);
		ws.send(JSON.stringify(message));
	}
});


// listen from server
ws.addEventListener("message", function(e) {
	// console.log(e.data);
	var messageData = JSON.parse(e.data);
	console.log(messageData.header + ", " + messageData.sender + ", " + messageData.body);
	if (isDirective(messageData)) {
		saveInfo(messageData);
	} else if (messageData.header == "Rejected") {
		rejectInfo(messageData);
	} else if (messageData.header == "message") {
		Materialize.toast(messageData.body, 2000);
	} else {
		// regular message, originally from client
		if (messageData.sender != client.id) {
			Materialize.toast("Command recieved.", 2000);
			if (messageData.header == "stroke+") {
				addStroke(messageData.body);
				Materialize.toast("Brush stroke recieved.", 2000);
			} else if (messageData.header == ".") {
				undoStroke();
			} else if (messageData.header == "+") {
				redoStroke();
			} else if (messageData.header == "..") {
				clearStrokes();
			} else if (messageData.header == "++") {
				synchronize(messageData.body);
			}

			redraw();
		}
	}

	
	// document.getElementById("chatlog").innerHTML += "<p>" + messageData + "</p>";
});

function isDirective(messageData) {
	return messageData.header == "*";
}

function saveInfo(messageData) {
	var commands = messageData.body.split(",");
	var key = commands[0];
	var value = commands[1];
	client[key] = value;

	if (value == "undefined") {
		value == undefined;
		document.getElementById(key).innerHTML = "";
	} else {
		document.getElementById(key).innerHTML = value;
	}
	
	Materialize.toast("Property '" + key + "' set to '" + value + "'", 1000);
}

function rejectInfo(messageData) {
	var commands = messageData.body.split(",");
	var key = commands[0];
	var value = commands[1];
	client[key] = value;

	Materialize.toast("Rejected request to set '" + key + "' to '" + value + "'", 2000);
}