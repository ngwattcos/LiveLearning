// placeholder event listener to listen for when
// a click is not placed on the canvas
// window.addEventListener("click", function() {
// 	// if the click was not registered on the canvas
// });

// store a reference to the input form to create a new classroom
var chooseClassroomForm = document.getElementById("createClass");
// add an event listener to check if a key is pressed on this element
chooseClassroomForm.addEventListener("keydown", function(e) {
	if (!e) {
		e = window.event;
	}

	// if enter key is pressed
	if (e.keyCode == 13) {
		// send a request to create a classrom of the name of the value of the input box
		ws.send(JSON.stringify(new Message("request-create-class", client.id, chooseClassroomForm.value)));
	}

});

// store a reference to the input form to join a new classroom
var joinClassroomForm = document.getElementById("joinClass");
// add an event listener to check if a key is pressed on this element
joinClassroomForm.addEventListener("keydown", function(e) {
	if (!e) {
		e = window.event;
	}

	/// if enter key is pressed
	if (e.keyCode == 13) {
		// send a request to join a classrom of the name of the value of the input box
		ws.send(JSON.stringify(new Message("request-join-class", client.id, joinClassroomForm.value)));
	}

});

// get a reference to the "yes" leaving button
var leave = document.getElementById("leave");
// add an event listener to check if this button is clicked
leave.addEventListener("click", function() {
	// send a request to the server to leave the classroom
	ws.send(JSON.stringify(new Message("leave-classroom", client.id, "please?")));
});

// get a reference to the "no" button
var noleave = document.getElementById("noleave");
// add an event listener to check if this button is clicked
noleave.addEventListener("click", function() {
	// castigate the user for being indecisive
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
	// alert("I was clicked!");
});

cv2.addEventListener("click", function() {
	// alert("I was clocked!");
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

// alert("akjadkjfh");


var sliderR = document.getElementById("r-slider");
var sliderG = document.getElementById("g-slider");
var sliderB = document.getElementById("b-slider");
var sliderSize = document.getElementById("size-slider");

sliderR.addEventListener("mouseup", function() {
	channelR = decToHex(sliderR.value);
});

sliderG.addEventListener("mouseup", function() {
	channelG = decToHex(sliderG.value);
});

sliderB.addEventListener("mouseup", function() {
	channelB = decToHex(sliderB.value);
});

sliderSize.addEventListener("mouseup", function() {

});

var channelR = "00";
var channelG = "00";
var channelB = "ff";

function decToHex(numStr) {
	var num = parseInt(numStr);
	var hexStr = num.toString(16);


	if (hexStr.length == 1) {
		hexStr = "0" + "" + hexStr;
	}
	if (hexStr.length == 0) {
		hexStr = "0" + "" + hexStr;
	}

	return hexStr;
}

var bottombar = document.getElementById("floatingBar");

var stopbar = document.getElementById("floatingbuttonstop");

var tutorialButton = document.getElementById("startTutorial");
tutorialButton.addEventListener("click", function() {
	if (bottombar.style.display = "none") {
		bottombar.style.display = "block";
		console.log("atffret");
	}
});

stopbar.addEventListener("click", function() {
	if (bottombar.style.display = "block") {
		bottombar.style.display = "none";
		console.log("atffret");
	}
	for (var i = 0; i < buttons.length; i++) {
		buttons[i].style.display = "none";
	}

	ButtonNumber =- 1;
});

var layerContainer = document.getElementById("layerContainer");

var saveAs = document.getElementById("saveAs");
var open = document.getElementById("open");

saveAs.addEventListener("click", function() {
	openModal.style.display = "none";
	saveModal.style.display = "block";
});

open.addEventListener("click", function() {
	openModal.style.display = "block";
	saveModal.style.display = "none";
});


// open.addEventListener("click", function() {
// 	var a = document.createElement("a");
// 	var file = new Blob([JSON.stringify(layers)], {type: "text/plain"});
// 	a.href = URL.createObjectURL(file);
// 	a.download = "layers.txt";
// 	a.click();
// });

var saveModal = document.getElementById("saveModal");
var openModal = document.getElementById("openModal");
var cancelSaveButton = document.getElementById("cancelSaveButton");
var saveButton = document.getElementById("saveButton");
var saveFileNameInput = document.getElementById("saveFileName");
var cancelOpenButton = document.getElementById("cancelOpenButton");
var openButton = document.getElementById("openButton");

cancelSaveButton.addEventListener("click", function() {
	saveModal.style.display = "none";
});

cancelOpenButton.addEventListener("click", function() {
	openModal.style.display = "none";
});

saveButton.addEventListener("click", function() {
	var a = document.createElement("a");
	var file = new Blob([JSON.stringify(layers)], {type: "text/plain"});
	a.href = URL.createObjectURL(file);
	a.download = saveFileNameInput.value;
	a.click();

	saveModal.style.display = "none";
});