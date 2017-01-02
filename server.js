/* TO-DOs
* (done) Errors when student is not assigned classroomid or permissions
* remove distinction between teacher and student (so there can be multiple teachers)
* store individual layers as id.layer (0.5)
*/

var http = require("http");
var queryString = require("querystring");

var server = http.createServer(function (request, response) {
	// var queryData = url.parse(request.url, true).query;
	// response.writeHead(200, {"Content-Type": "text/plain"});
	// console.log("adfasd");

	// if (queryData.name) {
	// 	// user told us their name in the GET request, ex: http://host:8000/?name=Tom
	// 	response.end('Hello ' + queryData.name + '\n');

	// } else {
	// 	response.end("Hello World\n");
	// }
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

var classrooms = {};

// is a directive as long as there is > 1 occurence of letter
function isDirective(str) {
	var alpha = /^[a-zA-Z-]+$/;
	if (str.match(alpha)) {
		return true;
	}
	return false;
}

// standard communication with clients
function Message(header, sender, body) {
	this.header = header;
	this.sender = sender;
	this.body = body;
}

function keyExists(key, obj) {
	return Object.keys(obj).indexOf(key) != -1;
}

function sendMessage(clientid, message) {
	clients[clientid].sendUTF(JSON.stringify(message));
}

function createClassroom(classroomid) {
	classrooms[classroomid] = {
		students: {},
		teacher: undefined
	};
}

function admitTeacherToClassroom(id, classroomid) {
	classrooms[classroomid].teacher = clients[id];
}

function admitStudentToClassroom(id, classroomid) {
	classrooms[classroomid].students[id] = clients[id];
}

function isAssignedClassroom(id) {
	return clients[id].classroomid;
}

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

function deleteClassroom(classroomid) {
	if (classrooms[classroomid]) {
		delete classrooms[classroomid];
	}
}

// remove client from list of clients in the classroom
function exitClassroomTeacher(id) {
	// server-side
	// remove client from classroom
	var classroomid = clients[id].classroomid;
	// you can only remove the student from the classroom if the classroom exists
	if (classroomid && classrooms[classroomid]) {
		delete classrooms[classroomid].teacher;
	}
	
}

function exitClassroomStudent(id) {
	// server-side
	// remove client from classroom
	var classroomid = clients[id].classroomid;
	// you can only remove the student from the classroom if the classroom exists
	if (classroomid && classrooms[classroomid]) {
		delete classrooms[classroomid].students[id];
	}
	
}

// client no longer belongs to a classroom
function leaveClassroom(id) {
	delete clients[id].classroomid;
	delete clients[id].permissions;
}

// tells the client: you no longer belong to a class
function leaveClassroomClientSide(id) {
	var classroomid = clients[id].classroomid;
	sendMessage(id, new Message("*", "server", "classroomid,undefined"));
	sendMessage(id, new Message("*", "server", "permissions,undefined"));
	sendMessage(id, new Message("message", "server", "Disconnecting from classroom '" + classroomid + "'"));
}

function studentLeavesClassroom(id) {
	leaveClassroomClientSide(id);
	exitClassroomStudent(id);
	leaveClassroom(id);
}

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
	leaveClassroom(id);

	// client-side
	leaveClassroomClientSide(id);
}

function isTeacher(id) {
	return clients[id].permissions == "teacher";
}

function isStudent(id) {
	return clients[id].permissions == "student";
}

// figures out whether user is student or teacher
function userLeavesClassroom(id) {
	if (isTeacher(id)) {
		teacherLeavesClassroom(id);
	} else if (isStudent(id)) {
		studentLeavesClassroom(id);
	}
}

// only runs when a request occurs

wsServer.on("request", function(request) {
	var connection = request.accept("echo-protocol", request.origin);

	var id = count++;
	clients[id] = connection;

	// tell client his id
	clients[id].sendUTF(JSON.stringify(new Message("*", "server", "id," + id)));

	console.log((new Date()) + " Connection accepted [" + id + "]");

	// recieved  data
	connection.on("message", function(message) {

		if (message.type == "utf8") {
			var messageData = JSON.parse(message.utf8Data);
			console.log(messageData.header + ", " + messageData.sender);
			// console.log(isDirective(messageData.header));
			// console.log(messageData.header + "? " + (messageData.header == "request-create-class"));
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
				} else if (messageData.header == "request-join-class") {
					// check if classroomid exists in classrooms list
					if (keyExists(messageData.body, classrooms)) {
						if (!isAssignedThisClassroom(id, messageData.body)) {
							// connect on server-side
							// assign the student a classroom
							joinClassroom(id, messageData.body, "student");
							// place the student into the classroom
							admitStudentToClassroom(id, messageData.body)


							// client-side
							// tell student that he/she is admitted to classroom
							sendMessage(id, new Message("*", "server", "classroomid," + messageData.body));
							// give student-level permissions
							sendMessage(id, new Message("*", "server", "permissions,student"));
						} else {
							// already part of the class!
							sendMessage(id, new Message("message", "server", "Can not join a class you are already in."));
						}
						
					} else {
						// send rejection message; cannot join class that does not exist
						sendMessage(id, new Message("Rejected", "server", "classroomid," + messageData.body));
					}

				} else if (messageData.header == "leave-classroom") {
					// check if part of classroom
					if (isAssignedClassroom(id)) {
						// leave the classroom, whether student or teacher
						userLeavesClassroom(id);
						
					} else {
						sendMessage(id, new Message("message", "server", "Can not leave a class you are not in."));
					}
				}
			} else {
				// send message back to each client
				if (isAssignedClassroom(id)) {
					var classroomid = clients[id].classroomid;
					// console.log(Object.keys(classrooms[classroomid].students));
					for (var i in classrooms[classroomid].students) {
						classrooms[clients[id].classroomid].students[i].sendUTF(message.utf8Data);
						
					}
				}
				
			}
			
		} else if (message.type == "binary") {
			console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
			connection.sendBytes(message.binaryData);
		}
		
	});

	connection.on("close", function(reasonCode, description) {
		// remove references to student
		userLeavesClassroom(id);
		delete clients[id];
		console.log((new Date()) +" Peer " + connection.remoteAddress + " disconnected.");
	});
	console.log(count);
});