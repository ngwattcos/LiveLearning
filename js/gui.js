// store a reference to the input form to create a new classroom
var chooseClassroomForm = document.getElementById("createClass");

// add an event listener to check if a key is pressed on this element
chooseClassroomForm.addEventListener("keydown", function(e) {
	// if event parameter is not defined, then set it to window.event
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

// integer represnting current helper
var ButtonNumber = -1;

// list of all helpers in the tutorial
var buttons = document.getElementsByClassName("holder");

// function that hides all helper buttons at once
function hideAllButtons() {
	for (var i = 0; i < buttons.length; i++) {
		buttons[i].style.display = "none";
	}
}

// once the window loads, hide all helpers
window.addEventListener("load", function() {
	hideAllButtons();
});


// button that goes to next tutorial helper
var nextButton = document.getElementById("floatingbutton");

// if clicked, go to next helper
nextButton.addEventListener("click", function() {
	ButtonNumber++;

	// if reaching the last helper, go back to the first one
	if (ButtonNumber >= buttons.length) {
		ButtonNumber = 0;
	}

	// hide all buttons, then show the current button
	hideAllButtons();
	buttons[ButtonNumber].style.display = "block";

});


// bar containing Next and Stop Tutorial buttons when
// Run Tutorial button is clicked
var bottombar = document.getElementById("floatingBar");

// stop button in bottom bar 
var stopbar = document.getElementById("floatingbuttonstop");

// element representing the button triggering tutorial
var tutorialButton = document.getElementById("startTutorial");

// event listener that opens the tutorial helper
tutorialButton.addEventListener("click", function() {
	// show the tutorial helper
	if (bottombar.style.display = "none") {
		bottombar.style.display = "block";
	}
	//if the bottom bar is not displayed and the Run Tutorial button is pressed, it will appear 

});

// event listener that stops the tutorial
stopbar.addEventListener("click", function() {
	// hide the tutorial elements
	if (bottombar.style.display = "block") {
		bottombar.style.display = "none";
	}
	// if the stop tutorial button is pressed, the bottom bar will hide 
	for (var i = 0; i < buttons.length; i++) {
		buttons[i].style.display = "none";
	}
	
	//resets tutorial to first window 
	ButtonNumber =- 1;
	
});

// sliders that represent the R, G, and B channels
var sliderR = document.getElementById("r-slider");
var sliderG = document.getElementById("g-slider");
var sliderB = document.getElementById("b-slider");
// slider that represents the thickness of the brush
var sliderSize = document.getElementById("size-slider");

// event listener that updates the A channel
// based on the position of the slider
sliderR.addEventListener("mouseup", function() {
	channelR = decToHex(sliderR.value);
});

// event listener that updates the G channel
// based on the position of the slider
sliderG.addEventListener("mouseup", function() {
	channelG = decToHex(sliderG.value);
});

// event listener that updates the B channel
// based on the position of the slider
sliderB.addEventListener("mouseup", function() {
	channelB = decToHex(sliderB.value);
});



// the strings representing the R, G, and B channels
var channelR = "00";
var channelG = "00";
var channelB = "ff";

// converts a String representing a number
// into a hexadecimal strong
function decToHex(numStr) {
	var num = parseInt(numStr);
	var hexStr = num.toString(16);

	// add a "0" placeholder if necessary
	if (hexStr.length == 1) {
		hexStr = "0" + "" + hexStr;
	}
	// add another "0" placeholder if necessary
	if (hexStr.length == 0) {
		hexStr = "0" + "" + hexStr;
	}

	return hexStr;
}


// element that containes the "links" of each layer
var layerContainer = document.getElementById("layerContainer");
// element representing menu item that triggers "save" modal
var saveAs = document.getElementById("saveAs");
// element representing menu item that triggers "open" modal
var open = document.getElementById("open");

// event listener that opens the "save" modal box
saveAs.addEventListener("click", function() {
	openModal.style.display = "none";
	saveModal.style.display = "block";
});

// event listener that opens the "open" modal box
open.addEventListener("click", function() {
	openModal.style.display = "block";
	saveModal.style.display = "none";
});

// element representing save layers modal
var saveModal = document.getElementById("saveModal");
// element representing open layers modal
var openModal = document.getElementById("openModal");
// element representing the cancel saving button
var cancelSaveButton = document.getElementById("cancelSaveButton");
// element representing the saving button
var saveButton = document.getElementById("saveButton");
// element representing the input box for filename
var saveFileNameInput = document.getElementById("saveFileName");
// element representing the cancel opening button
var cancelOpenButton = document.getElementById("cancelOpenButton");
// element representing the opening file button
var openButton = document.getElementById("openButton");

// event listener that cancels and exists the "save" modal
cancelSaveButton.addEventListener("click", function() {
	saveModal.style.display = "none";
});

// event listener that cancels and exists the "open" modal
cancelOpenButton.addEventListener("click", function() {
	openModal.style.display = "none";
});

// event listener that saves the layer into a JSON file
// onto the client's hard drive
saveButton.addEventListener("click", function() {
	var a = document.createElement("a");
	// create a "Blob" representing a data file
	var file = new Blob([JSON.stringify(layers)], {type: "text/plain"});
	a.href = URL.createObjectURL(file);
	a.download = saveFileNameInput.value;
	a.click();

	// close the "Save" modal box
	saveModal.style.display = "none";
});

// event listener that closes the "open" modal box when
// open button is selected
openButton.addEventListener("click", function() {
	openModal.style.display = "none";
});

// event listener for the "open file" button
openButton.addEventListener("change", function(evt) {
	// a list of files is returned
	var files = evt.target.files;
	// we are only concerned with the first one
	var f = files[0];

	// create a FileReader
	var reader = new FileReader();

	// callback function when the reader loads the file
	reader.onload = (function(theFile) {
		return function(e) {
			layers = JSON.parse(e.target.result);
			redraw();
		};
	})(f);

	// actually load the file
	reader.readAsText(f);

});

// element represnting open chat button
var openChat = document.getElementById("openChat");
// element representing close chat button
var closeChat = document.getElementById("closeChat");
// element representing the chat box container div
var chatBoxContainer = document.getElementById("chatBoxContainer");

// "..." button that opens the chatbox
openChat.addEventListener("click", function(e) {
	chatBoxContainer.style.display = "block";
});

// button that closes the chatbox
closeChat.addEventListener("click", function() {
	chatBoxContainer.style.display = "none";
});