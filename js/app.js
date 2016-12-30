var ws = new WebSocket("ws://127.0.0.1:1234", "echo-protocol");

var registered = false;
var client = {};

var canvas = document.getElementById("canvas");

// send strokes to the server
canvas.addEventListener("mouseup", function() {
	if (client.id != undefined) {
		var message = new Message("s", client.id, strokes[strokeNum]);
		ws.send(JSON.stringify(message));
	}
	
});

undo.addEventListener("click", function() {
	if (client.id != undefined) {
		var message = new Message("-", client.id, "");
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
		var message = new Message("--", client.id, "");
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
	var msg = e.data;
	if (isDirective(msg)) {
		saveInfo(msg);
	} else {
		// regular message, originally from client
		var message = JSON.parse(msg);
		if (message.sender != client.id) {
			if (message.header == "s") {
				addStroke(message.body);
			} else if (message.header == "-") {
				undoStroke();
			} else if (message.header == "+") {
				redoStroke();
			} else if (message.header == "--") {
				clearStrokes();
			} else if (message.header == "++") {
				synchronize(message.body);
			}

			redraw();
		}
	}

	
	// document.getElementById("chatlog").innerHTML += "<p>" + msg + "</p>";
});

function isDirective(str) {
	if (str.length > 0 && str[0] == "*") {
		return true;
	}

	return false;
}

function saveInfo(str) {
	var commands = str.split(",");
	var key = commands[0];
		key = key.substring(1, key.length);
	var value = commands[1];
	client[key] = value;

	// console.log(key + ", " + value);
	document.getElementById(key).innerHTML = value;
}