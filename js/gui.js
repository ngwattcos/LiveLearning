
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


function openPanel() {

}

function closePanel() {
	
}


var cv1 = document.getElementById("canvasButton1");
var cv2 = document.getElementById("canvasButton2");

var panel1 = document.getElementById("panel1");
var panel2 = document.getElementById("panel2");

cv1.addEventListener("click", function() {

});

cv2.addEventListener("click", function() {

});

var ButtonNumber = -1;

var buttons = document.getElementsByClassName("holder");

// initiall
function hideAllButtons() {
	for (var i = 0; i < buttons.length; i++) {
		buttons[i].style.display="none";
	}

}

// once the window loads, hide all things

window.addEventListener("load", function() {
	hideAllButtons();
	console.log("window has loaded");
});




var nextButton = document.getElementById("floatingbutton");
nextButton.addEventListener("click", function() {
	ButtonNumber++;

	if (ButtonNumber >= buttons.length) {
		ButtonNumber=0;
	}

	hideAllButtons();
	buttons[ButtonNumber].style.display = "block";

	console.log(ButtonNumber);
});