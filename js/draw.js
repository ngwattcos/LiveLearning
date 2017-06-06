/*
* Mouse coordinate solution:
* http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element

*/

// store a jQuery reference to the canvas...
var cv = $("canvas");

// to modify it
cv.css({"border-color": "#C1E0FF", 
	"border-width":"0px", 
	"border-style":"solid",
});

// store a reference to the 2D drawing context of the canvas
// in order to draw on it and format brushstrokes
var context = document.getElementById("canvas").getContext("2d");

// format size of canvas
context.canvas.width = 1100;
context.canvas.height = 600;
context.lineJoin = "round";

// solution to finding cursor position of on an absolute-positioned canvas
// http://stackoverflow.com/questions/5085689/tracking-mouse-
// position-in-canvas-when-no-surrounding-element-exists/5086147#5086147
function findPos(obj) {
	var curleft = 0, curtop = 0;
	if (obj.offsetParent) {
		do {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		} while (obj = obj.offsetParent);
		return { x: curleft, y: curtop };
	}
	return undefined;
}

// boolean that stores whether mouse is pressed
var paint = false;

// stores the brush stroke histories of each level
// is not implemented yet
var layers = [];
var currentLayer;
var currentLayerIdx;

/* How a "layer" object literal will look like
{
	id: "shared.0" or "layer.0"
	strokes: [].
	strokeNum: 5,
	futureStrokes: []
}

*/

//https://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another

Array.prototype.move = function (old_index, new_index) {
	if (new_index >= this.length) {
		var k = new_index - this.length;
		while ((k--) + 1) {
			this.push(undefined);
		}
	}
	this.splice(new_index, 0, this.splice(old_index, 1)[0]);
	return this; // for testing purposes
};

function addLayer(newLayer) {
	layers.push(newLayer);

	currentLayerIdx = layers.length - 1;
	currentLayer = layers[currentLayerIdx];

	console.log("created layer with name:" + newLayer.name);

	// update gui
}

function createLayer(_name) {
	var _prev = getLayerByName(_name);

	if (_prev != null) {

	} else {
		return new Layer(_name);
	}
}

function deleteLayer(_idx) {
	layers.splice(_idx, 1);

	// update gui
}

function changeLayer(idx) {
	// attempt to change layer
	if (idx >= 0 && idx <= layers.length - 1) {
		currentLayer = layers[idx];
		currentLayerIdx = idx;
	}
}

addLayer(createLayer("Untitled"));
addLayer(createLayer("Untitled1"));
addLayer(createLayer("Untitled2"));

function moveLayer(idx1, idx2) {
	layers.move(idx1, idx2);
}

function getLayerByName(_name) {
	return layers.find(function(element) {
		return element.name === _name;
	});
}

function Layer(_name, _strokes) {
	this.name = _name;
	this.strokeNum;
	this.futureStrokes = [];
	this.strokes = [];
	this.strokeNum = this.strokes.length - 1;
	this.visible = true;
}

// layers.add(new Layer())


// stores the index of the current stroke
// var strokeNum = -1;

// stores the past brush stroke history

// stores the future brush stroke history
var futureStrokes = [];

// addes a "dot" of paint to the current brush stroke
function addClick(x, y, dragging) {
	var colorStr = "#" + channelR + "" + channelG + "" + channelB;
	console.log(colorStr);
	// console.log(sliderSize.value + ", " + channelR + "" + channelG + "" + channelB);
	// strokes[strokeNum].push({x: x, y: y, lineWidth: sliderSize.value, strokeStyle: colorStr});
	layers[currentLayerIdx].strokes[layers[currentLayerIdx].strokeNum].push({x: x, y: y, lineWidth: sliderSize.value, strokeStyle: colorStr});
	// console.log(context.strokeStyle);
}

// reloads the canvas to reflect the new changes made
function redraw() {
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);

	// loop through each individual brush stroke
	for (var l = 0; l < layers.length; l++) {
		if (layers[l].visible) {
			for (var i = 0; i < layers[l].strokes.length; i++) {
			// loop through each pixel per brush stroke
				for (var j = 0; j < layers[l].strokes[i].length; j++) {
					// check if pixel is just a dot...
					if (layers[currentLayerIdx].strokes[i].length <= 1) {
						// create a rectangle representing the first point of paint
						context.beginPath();
						context.strokeStyle = layers[l].strokes[i][0].strokeStyle;
						context.lineWidth = layers[l].strokes[i][0].lineWidth;
						context.strokeRect(layers[l].strokes[i][0].x, layers[l].strokes[i][0].y, 1, 1);
						context.closePath();
					} else {
						// if this pixel is part of a larger brush stroke
						if (j > 0) {
							// stroke a line segment from the previous pixel to the current pixel
							context.beginPath();
							context.lineWidth = layers[l].strokes[i][j].lineWidth;
							context.strokeStyle = layers[l].strokes[i][j].strokeStyle;
							context.moveTo(layers[l].strokes[i][j - 1].x, layers[l].strokes[i][j - 1].y);
							context.lineTo(layers[l].strokes[i][j].x, layers[l].strokes[i][j].y);
							context.closePath();
							context.stroke();
						}
						
					}
					
				}
			}
		}
		
		
	}
	
}

// addes a given brush stroke to the brush stroke history
// used for when receiving a brush stroke from another user from the server
function addStroke(_data) {
	if (_data.length > 0) {


		var _layer = getLayerByName(_data[0]);

		if (_layer != null) {
			_layer.strokes.push(_data[1]);
			_layer.strokeNum = _layer.strokes.length - 1;

			_layer.futureStrokes = [];
		} else {
			
		}

		

		// clear the future stroke history
		layers[currentLayerIdx].futureStrokes = [];
	} else {
		// push an empty array
		layers[currentLayerIdx].strokes.push([]);
		layers[currentLayerIdx].strokeNum = layers[currentLayerIdx].strokes.length - 1;

		layers[currentLayerIdx].futureStrokes = [];
	}
}

// undoes the current brush stroke
function undoStroke() {
	if (layers[currentLayerIdx].strokes.length > 0) {
		// moves the current brush stroke tot he list of future brush strokes

		var lastStroke = layers[currentLayerIdx].strokes.length - 1;
		layers[currentLayerIdx].futureStrokes.push(
			layers[currentLayerIdx].strokes.splice(
				lastStroke, 1
		)[0]);
		// revert the stroke index
		layers[currentLayerIdx].strokeNum--;
	}
}

function undoStrokeUpdate(_data) {
	if (_data.length > 0) {
		var _layer = getLayerByName(_data[0]);
		var lastStroke = layers[currentLayerIdx].strokes.length - 1;
		if (_layer != null) {
			_layer.futureStrokes.push(_layer.strokes.splice(lastStroke, 1)[0]);
			_layer.strokeNum--;
		}
	}
	
}

// redoes the next future brush stroke
function redoStroke() {
	if (layers[currentLayerIdx].futureStrokes.length > 0) {
		// moves the lastest future stroke to the back of the list of strokes

		var nextStroke = layers[currentLayerIdx].futureStrokes.length - 1;
		layers[currentLayerIdx].strokes.push(layers[currentLayerIdx].futureStrokes.splice(nextStroke, 1)[0]);
		layers[currentLayerIdx].strokeNum++;
	}
}

function redoStrokeUpdate(_data) {
	if (_data.length > 0) {
		var _layer = getLayerByName(_data[0]);

		if (_layer != null) {
			var nextStroke = _layer.futureStrokes.length - 1;
			_layer.strokes.push(_layer.futureStrokes.splice(nextStroke, 1)[0]);
			_layer.strokeNum++;
		}
		
	}
}

// deletes all brush stroke history
function clearStrokes() {
	layers[currentLayerIdx].strokeNum = -1;
	layers[currentLayerIdx].strokes = [];
	layers[currentLayerIdx].futureStrokes = [];
}

// completely changes brush stroke history to reflect data recieved from server
// used for when brush strokes go out of sync due to network latency
function synchronize(data) {
	var layer = getLayerByName(data[0]);

	if (layer != null) {
		console.log("layer to be synchronized exists");
		layers[currentLayerIdx].strokes = data[1];
		layers[currentLayerIdx].futureStrokes = data[1];
		layers[currentLayerIdx].strokeNum = strokes.length - 1;
	} else {
		console.log("layer to be synchronized does not exist");
		addLayer(new Layer(data[0]));
		layers[currentLayerIdx].strokes = data[1];
		layers[currentLayerIdx].futureStrokes = data[1];
		layers[currentLayerIdx].strokeNum = strokes.length - 1;
	}

	redraw();
}

// add an event listener to add a dot of paint
// for when a mouse is pressed down
$("#canvas").mousedown(function(e) {
	var mouseX = e.pageX - this.offsetLeft;
	var mouseY = e.pageY - this.offsetTop;

	redraw();
	addStroke([]);

	paint = true;
	addClick(mouse.x, mouse.y, true);
	redraw();
});


// add an event listener to add a dot of paint
// if mouse is dragged
$("#canvas").mousemove(function(e) {
	if (paint) {
		addClick(mouse.x, mouse.y);
		redraw();
	}
});

// store the mouse coordinates
var mouse = {
	x: 0, y: 0
}

// http://stackoverflow.com/questions/5085689/tracking-
// mouse-position-in-canvas-when-no-surrounding-element-exists/5086147#5086147
// add event listener for when mouse moves to update mouse position
$('#canvas').mousemove(function(e) {
	var pos = findPos(this);
	var x = e.pageX - pos.x;
	var y = e.pageY - pos.y;
	var coordinateDisplay = "x=" + x + ", y=" + y;

	mouse.x = x;
	mouse.y = y;
});

// add event listener to stop the brush from painting
// when the mouse is released
$("#canvas").mouseup(function(e) {
	paint = false;
	// printStrokes();
});

// add event listener to stop the brush from painting
// when the mouse leaves the canvas
$("#canvas").mouseleave(function(e) {
	paint = false;
});

// utitlity tool to print brush stroke history to the canvas
function printStrokes() {
	var msg = "";
	for (var i = 0; i < strokes.length; i++) {
		msg += "\n\n{";
		for (var j = 0; j < strokes[i].length; j++) {
			msg += " (" + strokes[i][j].x + ", " + strokes[i][j].y + ") ";
		}
		msg += "}";
	}
	// console.log(msg);
}

// utility tool to convert stroke objects into a string
function strokeToString() {
	var msg = "";
	for (var i = 0; i < strokes[strokeNum].length; i++) {
		msg += strokes[strokeNum].x + "," + strokes[strokeNum].y;
		if (i > 0 && i < strokes[strokeNum].length - 1) {
			msg += ":";
		}
	}

	return msg;
}

// get reference to the undo button
var undo = document.getElementById("undo");
var undo2 = document.getElementById("undo2");

// if undo button is clicked, undo the last stroke
undo.addEventListener("click", function() {
	undoStroke();
	redraw();
});

undo2.addEventListener("click", function() {
	undoStroke();
	redraw();
});

// get reference to the redo button
var redo = document.getElementById("redo");
var redo2 = document.getElementById("redo2");

// if redo button is clicked, redo the last undone stroke
redo.addEventListener("click", function() {
	redoStroke();
	redraw();
});

redo2.addEventListener("click", function() {
	redoStroke();
	redraw();
});

// get reference to the clear button
var clear = document.getElementById("clear");
var clear2 = document.getElementById("clear2");

// if the clear button is clicked, completely clear the canvas
clear.addEventListener("click", function() {
	clearStrokes();

	redraw();
});

clear2.addEventListener("click", function() {
	clearStrokes();

	redraw();
});

