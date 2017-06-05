/* TO-DOs
* (done) Errors when student is not assigned classroomid or permissions
* remove distinction between teacher and student (so there can be multiple teachers)
* store individual layers as id.layer (0.5)
* if a user leaves a classroom, let all clients know that
*/

var http = require("http");
var queryString = require("querystring");

// create an HTTP server
var server = http.createServer(function (request, response) {

});

// event listener that runs once the server is created
server.listen(1234, function() {
	console.log((new Date()) + " Server is listening on port 1234.");
});

// import the websocket module
var WebSocketServer = require("websocket").server;

// create a Web Socket Server using the HTTP server above
wsServer = new WebSocketServer({
	httpServer: server
});

// keep track of the unique id of each connected client
var count = 0;

// store a list of clients in a dictionary/object literal with key:client pairs
var clients = {};

// store a list of classrooms as a key:classroom pair
var classrooms = {};

// checks if a recieved message (from a client) is intended for the server
// only true if the message header is made of letters and "-" sign
function isDirective(str) {
	var alpha = /^[a-zA-Z-]+$/;
	if (str.match(alpha)) {
		return true;
	}	
	return false;
}

// define a Message object; standard communication shared with clients
function Message(header, sender, body) {
	this.header = header;
	this.sender = sender;
	this.body = body;
}

// check if a key exists in a dictionary/object literal
function keyExists(key, obj) {
	return Object.keys(obj).indexOf(key) != -1;
}

// shortcut function to send data, containing a Message object, to the user
function sendMessage(clientid, message) {
	clients[clientid].sendUTF(JSON.stringify(message));
}

// create a classroom and add it to the stored "list"
// ("dictionary" / object literal) of classroom objects
function createClassroom(classroomid) {
	classrooms[classroomid] = {
		clients: {},
		students: {},
		teacher: undefined
	};
}

// will physically add a teacher to the classroom
// will become obsolete
function admitTeacherToClassroom(id, classroomid) {
	classrooms[classroomid].teacher = clients[id];
}

// will physically add a student to the classroom
// will become obsolete
function admitStudentToClassroom(id, classroomid) {
	classrooms[classroomid].students[id] = clients[id];
}

// will physically add a client to the classroom
function admitClientToClassroom(id, classroomid) {
	classrooms[classroomid].clients[id] = clients[id];
}

// returns whether client's classroomid is defined
function isAssignedClassroom(id) {
	return clients[id].classroomid != undefined;
}

// checks if client with id is assigned to classroom of classroomid
function isAssignedThisClassroom(id, classroomid) {
	// return classrooms[classroomid].clients[id];
	return clients[id].classroomid && clients[id].classroomid == classroomid;
}

function joinClassroom(id, classroomid, permissions) {
	// give user appropriate classroomid, permissions
	clients[id].classroomid = classroomid;

	// give user appropriate  permissions ("student" or "teacher")
	clients[id].permissions = permissions;
}

// deletes a classroom of classroomid
function deleteClassroom(classroomid) {
	if (classrooms[classroomid]) {
		delete classrooms[classroomid];
	}
}

// remove teacher from list of clients in the classroom
function exitClassroomTeacher(id) {
	// server-side
	// remove client from classroom
	var classroomid = clients[id].classroomid;
	// you can only remove the student from the classroom if the classroom exists
	if (classroomid && classrooms[classroomid]) {
		delete classrooms[classroomid].teacher;
	}
	
}

// physically remove student from classroom
// will become obsolete
function exitClassroomStudent(id) {
	// server-side
	// remove client from classroom
	var classroomid = clients[id].classroomid;
	// you can only remove the student from the classroom if the classroom exists
	if (classroomid && classrooms[classroomid]) {
		delete classrooms[classroomid].students[id];
	}
	
}
// physically remove client from classroom
function exitClassroomClient(id) {
	var classroomid = clients[id].classroomid;
	// you can only remove the student from the classroom if the classroom exists
	if (classroomid && classrooms[classroomid]) {
		delete classrooms[classroomid].clients[id];
	}
}

// client no longer belongs to a classroom;
// unassign classroomid and permissions
function leaveClassroom(id) {
	delete clients[id].classroomid;
	delete clients[id].permissions;
}

// tells the client: you no longer belong to a class
function leaveClassroomClientSide(id) {
	var classroomid = clients[id].classroomid;
	sendMessage(id, new Message("*", "server", "classroomid,undefined"));
	sendMessage(id, new Message("*", "server", "permissions,undefined"));
	sendMessage(id, new Message("message", "server", "Disconnecting from classroom"));
}

// combined action of a student leaving a classroom:
// ...student leaves the class,
// ...student is unassigned from the class
function studentLeavesClassroom(id) {
	// tells the client: you no longer belong to a class
	leaveClassroomClientSide(id);

	exitClassroomStudent(id);
	// client no longer belongs to a classroom;
	// unassign classroomid and permissions
	leaveClassroom(id);
}

// combined action of a teacher leaving a classroom:
// ...teacher leaves the class,
// ...remove all students of this class,
// ...teacher is unassigned from the class
function teacherLeavesClassroom(id) {
	var classroomid = clients[id].classroomid;
	
	// disconnect all students from this classroom
	for (var studentid in classrooms[classroomid].students) {
		// tell each student that he/she is being disconnected
		studentLeavesClassroom(studentid);
	}

	// also, delete the classroom
	deleteClassroom(classroomid);
	

	// server-side
	exitClassroomTeacher(id);
	// client no longer belongs to a classroom;
	// unassign classroomid and permissions
	leaveClassroom(id);

	// tells the client: you no longer belong to a class
	leaveClassroomClientSide(id);
}

// returns whether a user is a teacher
function isTeacher(id) {
	return clients[id].permissions == "teacher";
}

// returns whether a user is a student
function isStudent(id) {
	return clients[id].permissions == "student";
}

// figures out whether user is student or teacher,
// and makes the user leave with the appropriate protocol
function userLeavesClassroom(id) {
	if (isTeacher(id)) {
		teacherLeavesClassroom(id);
	} else if (isStudent(id)) {
		studentLeavesClassroom(id);
	}
}

// combined actions of a client leaving a classroom
function clientLeavesClassroom(id) {
	// tells the client: you no longer belong to a class
	leaveClassroomClientSide(id);

	exitClassroomClient(id);
	// client no longer belongs to a classroom;
	// unassign classroomid and permissions
	leaveClassroom(id);
}

// this function only runs when a request occurs
// a unique "copy" of this functions is assigned to
// each unique function
wsServer.on("request", function(request) {
	// store and accept the connection
	var connection = request.accept("echo-protocol", request.origin);

	// increment a unique identifier to store as a client id
	var id = count++;

	// store this connection in the "list" of clients
	clients[id] = connection;

	// tell client his id
	clients[id].sendUTF(JSON.stringify(new Message("*", "server", "id," + id)));

	// log to the console if client id
	console.log((new Date()) + " Connection accepted [" + id + "]");

	// recieved  data
	connection.on("message", function(message) {

		// if message type is UTF-8
		if (message.type == "utf8") {
			// parse and store the message as a Message object
			var messageData = JSON.parse(message.utf8Data);
			// log to the console the header and sender of hte message
			console.log(messageData.header + ", " + messageData.sender);

			// check if message was an instruction intended for the werver
			if (isDirective(messageData.header)) {
				// if this is a request to create a class
				if (messageData.header == "request-create-class") {

					// leave your current classroom first
					userLeavesClassroom(id);

					// if a classroom with this name exists already...
					if (keyExists(messageData.body, classrooms)) {
						// send back rejection
						sendMessage(id, new Message("Rejected", "Mr. Server", "classroomid," + messageData.body));
						
					} else {
						// server-side
						// create a classroom, with unique classroom id, with teacher in it
						createClassroom(messageData.body);

						// give the teacher a classroom
						joinClassroom(id, messageData.body, "teacher");

						// put the teacher into the classroom
						admitTeacherToClassroom(id, messageData.body);

						// client-side
						// tell this to the teacher/founder!
						sendMessage(id, new Message("*", "server", "classroomid," + messageData.body));
						sendMessage(id, new Message("*", "server", "permissions,teacher"));
					}
				// request to join an existing class
				} else if (messageData.header == "request-join-class") {
					// check if classroomid exists in classrooms list
					if (keyExists(messageData.body, classrooms)) {
						// check if this user is not already part of another classroom
						if (!isAssignedThisClassroom(id, messageData.body)) {
							// connect on server-side
							// assign the student the classroom
							joinClassroom(id, messageData.body, "student");
							// place the student into the classroom
							admitStudentToClassroom(id, messageData.body)

							// client-side
							// tell the student that he/she is admitted to classroom
							sendMessage(id, new Message("*", "server", "classroomid," + messageData.body));
							// give student-level permissions to user
							sendMessage(id, new Message("*", "server", "permissions,student"));
						} else {
							// already part of the class!
							sendMessage(id, new Message("message", "server", "Can not join a class you are already in."));
						}
						
					} else {
						// send back rejection message; cannot join class that does not exist
						sendMessage(id, new Message("Rejected", "server", "classroomid," + messageData.body));
					}

				// if the message was a request to leave a classroom
				} else if (messageData.header == "leave-classroom") {
					// check if the user is actually a part of classroom
					if (isAssignedClassroom(id)) {
						// leave the classroom, whether student or teacher
						userLeavesClassroom(id);
						
					} else {
						// notify the client that it is impossible to leave a class he/she is not a part of
						sendMessage(id, new Message("message", "server", "Can not leave a class you are not in."));
					}
				}
			} else {
				// this is a general message to be
				// forwarded/broadcasted to all clients in the sender's classroom
				if (isAssignedClassroom(id)) {
					var classroomid = clients[id].classroomid;
					// 
					for (var i in classrooms[classroomid].students) {
						classrooms[clients[id].classroomid].students[i].sendUTF(message.utf8Data);
						
					}
				}
			}
		
		// log that this was a binary message
		} else if (message.type == "binary") {
			console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
			connection.sendBytes(message.binaryData);
		}
		
	});

	connection.on("close", function(reasonCode, description) {
		// remove all references to student
		// user removes all references to classroom
		// user is gracefully disconnected from the server
		userLeavesClassroom(id);
		delete clients[id];
		console.log((new Date()) +" Peer " + id + " (" + connection.remoteAddress + ") disconnected.");
	});
	// print to the console the id of the user who is leaving
	console.log(count);
});