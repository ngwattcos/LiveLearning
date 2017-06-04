// local server ip
var ws = new WebSocket("ws://127.0.0.1:1234", "echo-protocol");
// ip address of Scott's laptop
// var ws = new WebSocket("ws://192.168.1.3:1234", "echo-protocol");
// ip address of lian's laptop
// var ws = new WebSocket("ws://192.168.1.5:1234", "echo-protocol");

// ip address of Raghav's workstation
// var ws = new WebSocket("ws://10.122.22.42:1234", "echo-protocol");

// stores whether a client is registered with server
var registered = false;

// stores client info
var client = {};

// store a reference to the canvas
var canvas = document.getElementById("canvas");

// send the latest stroke to the server if the mouse has been released form the curser
canvas.addEventListener("mouseup", function() {
	if (client.id != undefined) {
		var message = new Message("stroke+", client.id, [layers[currentLayerIdx].name, layers[currentLayerIdx].strokes[layers[currentLayerIdx].strokeNum]]);

		ws.send(JSON.stringify(message));
		Materialize.toast("Brush stroke sent.", 1000);
	}

});

// send data to undo the last stroke to the server if undo button is clicked
undo.addEventListener("click", function() {
	if (client.id != undefined) {
		var message = new Message(".", client.id, [layers[currentLayerIdx].name]);
		ws.send(JSON.stringify(message));
	}
});

undo2.addEventListener("click", function() {
	if (client.id != undefined) {
		var message = new Message(".", client.id, [layers[currentLayerIdx].name]);
		ws.send(JSON.stringify(message));
	}
});


// send data to redo the last undone stroke to the server if redo button is clicked
redo.addEventListener("click", function() {
	if (client.id != undefined) {
		var message = new Message("+", client.id, [layers[currentLayerIdx].name]);
		ws.send(JSON.stringify(message));
	}
});

redo2.addEventListener("click", function() {
	if (client.id != undefined) {
		var message = new Message("+", client.id, [layers[currentLayerIdx].name]);
		ws.send(JSON.stringify(message));
	}
});

// send data to the server to clear the canvas if the clear button is clicked
clear.addEventListener("click", function() {
	if (client.id != undefined) {
		var message = new Message("..", client.id, "");
		ws.send(JSON.stringify(message));
	}
});

// get a reference to the synchronize button
var synchronize1 = document.getElementById("synchronize");
var synchronize2 = document.getElementById("synchronize2");

// if clicked, send data to the server to synchronize screens
synchronize1.addEventListener("click", sendSynchronize);

synchronize2.addEventListener("click", sendSynchronize);

function sendSynchronize() {
	if (client.id != undefined) {
		var message = new Message("++", client.id, [layers[currentLayerIdx].name, layers[currentLayerIdx].strokes, layers[currentLayerIdx].futureStrokes]);
		ws.send(JSON.stringify(message));
	}
}


// listen to data coming from server
ws.addEventListener("message", function(e) {
	// console.log(e.data);
	var messageData = JSON.parse(e.data);
	// log all incoming Messages from the server
	console.log(messageData.header + ", " + messageData.sender + ", " + messageData.body);

	// if the message is a command from the server
	if (isDirective(messageData)) {
		// save the new data
		saveInfo(messageData);
	} else if (messageData.header == "Rejected") {
		// if the message informs the client that a request was rejected
		// "toast" a notification to the user
		rejectInfo(messageData);
	} else if (messageData.header == "message") {
		// if the message is just a generic informative message
		// "toast" the message to the user
		Materialize.toast(messageData.body, 2000);
	} else {
		// if the message is a command from another user
		if (messageData.sender != client.id) {
			Materialize.toast("Command recieved.", 2000);

			// if the command was to add a stroke
			if (messageData.header == "stroke+") {
				// add the stroke to the brush history
				addStroke(messageData.body);
				Materialize.toast("Brush stroke recieved.", 2000);
			} else if (messageData.header == ".") {
				// if the command was to undo a stroke
				// undo the stroke
				undoStrokeUpdate(messageData.body);
			} else if (messageData.header == "+") {
				// if the command was to redo the stroke
				// redo the stroke
				redoStrokeUpdate(messageData.body);
			} else if (messageData.header == "..") {
				// if the command was to clear the canvas
				// clear the brush history
				clearStrokes();
			} else if (messageData.header == "++") {
				// if the command was to syncrhonize the screen
				// synchronize the screen
				synchronize(messageData.body);
			}

			// redraw the canvas to reflect changes, just in case
			redraw();

		}

		if (messageData.header == "chatMessage+") {
				console.log("new chat message received");
				document.getElementById("prevMessages").innerHTML += messageData.body;
	}


});

// returns whether the message is an instruction from the server
function isDirective(messageData) {
	return messageData.header == "*";
}

// save the information from the server as a client property
function saveInfo(messageData) {
	var commands = messageData.body.split(",");
	var key = commands[0];
	var value = commands[1];
	client[key] = value;

	// if value is "undefined" as oppsed to defined,
	// revert all labels to default value
	if (value == "undefined") {
		value == undefined;
		document.getElementById(key).innerHTML = "";
		document.getElementById(key + "_title").innerHTML = "Classroom-name";
	} else {
		// set label value to the command
		document.getElementById(key).innerHTML = value;
		document.getElementById(key + "_title").innerHTML = value;
	}

	// "toast" a notification to the user that a property was changed.
	Materialize.toast("Property '" + key + "' set to '" + value + "'", 1000);
}

// notify the user that a request was rejected
function rejectInfo(messageData) {
	var commands = messageData.body.split(",");
	var key = commands[0];
	var value = commands[1];
	client[key] = value;

	Materialize.toast("Rejected request to set '" + key + "' to '" + value + "'", 2000);
}

var chatBox = document.getElementById("chatBox");

chatBox.addEventListener("keydown", function(e) { //something is wrong here
	// console.log("akdfhakjhfdkj");
	if (e.keyCode == 13) {
		var newChatMsg = new Message("chatMessage+", client.id, chatBox.value);
		ws.send(JSON.stringify(newChatMsg));
		console.log("attempted to send: " + newChatMsg.body);
	}

});
