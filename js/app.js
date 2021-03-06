// local server ip
// unfortunately only works locally (within LAN)
var ws = new WebSocket("ws://127.0.0.1:1234", "echo-protocol");
// ip address of Scott's laptop
// var ws = new WebSocket("ws://xxx.xxx.x.x:1234", "echo-protocol");
// ip address of lian's laptop
// var ws = new WebSocket("ws://xxx.xxx.x.x:1234", "echo-protocol");

// ip address of Raghav's workstation
// var ws = new WebSocket("ws://10.122.22.42:1234", "echo-protocol");

// stores whether a client is registered with server
var registered = false;

// stores client info such as id, permissions level
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
undo.addEventListener("click", undoSync);
undo2.addEventListener("click", undoSync);

function undoSync() {
	if (client.id != undefined) {
		var message = new Message(".", client.id, [layers[currentLayerIdx].name]);
		ws.send(JSON.stringify(message));
	}
}

// send data to redo the last undone stroke to the server if redo button is clicked
redo.addEventListener("click", redoSync);

redo2.addEventListener("click", redoSync);

// sends message to the students to redo their last undone brush stroke
function redoSync() {
	if (client.id != undefined) {
		var message = new Message("+", client.id, [layers[currentLayerIdx].name]);
		ws.send(JSON.stringify(message));
	}
}

// send data to the server to clear the canvas if the clear button is clicked
clear.addEventListener("click", clearSync);
clear2.addEventListener("click", clearSync);

// tells clients to clear their current layer
function clearSync() {
	if (client.id != undefined) {
		var message = new Message("..", client.id, "");
		ws.send(JSON.stringify(message));
	}
}

// get a reference to the synchronize button
var synchronize1 = document.getElementById("synchronize");
var synchronize2 = document.getElementById("synchronize2");

// if clicked, send data to the server to synchronize screens
synchronize1.addEventListener("click", sendSynchronize);
synchronize2.addEventListener("click", sendSynchronize);

// synchronize data with all other clients
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

		// if this is a chatMessagse, pay attention regardless
		// whether the sender is the same as the receiving client
		if (messageData.header == "chatMessage+") {
			// create a paragraph node
			var _para = document.createElement("p");
			// create a text node
			var _node = document.createTextNode(messageData.body.speaker + ": " + messageData.body.data);
			// add this text node to the paragraph
			_para.appendChild(_node);

			// add this new message to the list of messages display
			document.getElementById("prevMessages").appendChild(_para);
		}
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

	// update information about this current session
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

// the chatbox for messages between teachers, students
var chatBox = document.getElementById("chatBox");

// whenever a key is typed, run thus event listener
chatBox.addEventListener("keydown", function(e) {
	// if enter key is hit
	if (e.keyCode == 13) {
		var newChatMsg;

		// conditionally send a different kind of chat message
		// based on whether client is a teacher, student, or some other
		// unverified client
		// if the client is a teacher
		if (client && client["permissions"] == "teacher") {
			newChatMsg = new Message("chatMessage+", client.id, {
				speaker: "teacher",
				data: chatBox.value
			});
		// if client is a student
		} else if (client && client["permissions"] == "student") {
			newChatMsg = new Message("chatMessage+", client.id, {
				speaker: "student " + client["id"],
				data: chatBox.value
			});
		// if client is just a generic client
		} else {
			newChatMsg = new Message("chatMessage+", client.id, {
				speaker: "client " + client["id"],
				data: chatBox.value
			});
		}
		
		// send a stringified message to the server, to be
		// broadcast to everyone
		ws.send(JSON.stringify(newChatMsg));

		// reset chat box valye
		chatBox.value = "";
	}
});
