

window.addEventListener("click", function() {
	// if the click was not registered on
});

var clientInfoDiv = document.getElementById("");

var chooseClassroomForm = document.getElementById("createClass");

chooseClassroomForm.addEventListener("keydown", function(e) {
	if (!e) {
		e = window.event;
	}

	// e.preventDefault();
	if (e.keyCode == 13) {
		ws.send(JSON.stringify(new Message("request-create-class", client.id, chooseClassroomForm.value)));
	}
	
});

var joinClassroomForm = document.getElementById("joinClass");

joinClassroomForm.addEventListener("keydown", function(e) {
	if (!e) {
		e = window.event;
	}

	// e.preventDefault();
	if (e.keyCode == 13) {
		ws.send(JSON.stringify(new Message("request-join-class", client.id, joinClassroomForm.value)));
	}
	
});

var leave = document.getElementById("leave");

leave.addEventListener("click", function() {
	ws.send(JSON.stringify(new Message("leave-classroom", client.id, "please?")));
});

var noleave = document.getElementById("noleave");

noleave.addEventListener("click", function() {
	Materialize.toast("Hah! scruuub.", 2000);
});