/*
* Mouse coordinate solution:
* http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element

*/

// store a jQuery reference to the canvas...
var cv = $("canvas");

// to modify it
cv.css({"border-color": "#C1E0FF", 
	"border-width":"1px", 
	"border-style":"solid",
});

// store a reference to the 2D drawing context of the canvas
// in order to draw on it and format brushstrokes
var context = document.getElementById("canvas").getContext("2d");

// format size of canvas
context.canvas.width = 870;
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
var layers = {};

/* How a "layer" object literal will look like
{
	id: "shared.0" or "layer.0"
	strokes: [].
	strokeNum: 5,
	futureStrokes: []
}

*/

// stores the index of the current stroke
var strokeNum = -1;

// stores the past brush stroke history
var strokes = [];

// stores the future brush stroke history
var futureStrokes = [];

// addes a "dot" of paint to the current brush stroke
function addClick(x, y, dragging) {
	strokes[strokeNum].push({x: x, y: y, lineWidth: document.getElementById("brushSize").value, strokeStyle: document.getElementById("color").value});
	console.log(context.strokeStyle);
}

// reloads the canvas to reflect the new changes made
function redraw() {
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);

	// loop through each individual brush stroke
	for (var i = 0; i < strokes.length; i++) {
		// loop through each pixel per brush stroke
		for (var j = 0; j < strokes[i].length; j++) {
			// check if pixel is just a dot...
			if (strokes[i].length <= 1) {
				// create a rectangle representing the first point of paint
				context.beginPath();
				context.strokeStyle = strokes[i][0].strokeStyle;
				context.lineWidth = strokes[i][0].lineWidth;
				context.strokeRect(strokes[i][0].x, strokes[i][0].y, 1, 1);
				context.closePath();
			} else {
				// if this pixel is part of a larger brush stroke
				if (j > 0) {
					// stroke a line segment from the previous pixel to the current pixel
					context.beginPath();
					context.lineWidth = strokes[i][j].lineWidth;
					context.strokeStyle = strokes[i][j].strokeStyle;
					context.moveTo(strokes[i][j - 1].x, strokes[i][j - 1].y);
					context.lineTo(strokes[i][j].x, strokes[i][j].y);
					context.closePath();
					context.stroke();
				}
				
			}
			
		}
	}
}

// addes a given brush stroke to the brush stroke history
// used for when receiving a brush stroke from another user from the server
function addStroke(arr) {
	strokeNum++;
	strokes.push(arr);

	// clear the future stroke history
	futureStrokes = [];
}

// undoes the current brush stroke
function undoStroke() {
	if (strokes.length > 0) {
		// moves the current brush stroke tot he list of future brush strokes
		futureStrokes.push(strokes.splice(strokeNum, 1)[0]);
		// revert the stroke index
		strokeNum--;
	}
}

// redoes the next future brush stroke
function redoStroke() {
	if (futureStrokes.length > 0) {
		// moves the lastest future stroke to the back of the list of strokes
		strokes.push(futureStrokes.splice(futureStrokes.length - 1, 1)[0]);
		strokeNum++;
	}
}

function clearStrokes() {
	strokeNum = 0;
	strokes = [[]];
	futureStrokes = [];
}

function synchronize(data) {
	strokes = data[0];
	futureStrokes = data[1];
	strokeNum = strokes.length - 1;
}

$("#canvas").mousedown(function(e) {
	var mouseX = e.pageX - this.offsetLeft;
	var mouseY = e.pageY - this.offsetTop;

	redraw();
	addStroke([]);

	paint = true;
	addClick(mouse.x, mouse.y, true);
	redraw();
});


// if mouse is dragged
$("#canvas").mousemove(function(e) {
	if (paint) {
		addClick(mouse.x, mouse.y);
		redraw();
	}
});

var mouse = {
	x: 0, y: 0
}

// http://stackoverflow.com/questions/5085689/tracking-
// mouse-position-in-canvas-when-no-surrounding-element-exists/5086147#5086147
$('#canvas').mousemove(function(e) {
	var pos = findPos(this);
	var x = e.pageX - pos.x;
	var y = e.pageY - pos.y;
	var coordinateDisplay = "x=" + x + ", y=" + y;

	mouse.x = x;
	mouse.y = y;
});

$("#canvas").mouseup(function(e) {
	paint = false;
	// printStrokes();
});

$("#canvas").mouseleave(function(e) {
	paint = false;
});

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



var undo = document.getElementById("undo");

// clears
undo.addEventListener("click", function() {
	undoStroke();
	redraw();
});

var redo = document.getElementById("redo");

redo.addEventListener("click", function() {
	redoStroke();
	redraw();
})

var clear = document.getElementById("clear");

clear.addEventListener("click", function() {
	clearStrokes();

	redraw();
});

// var redrawBtn = document.getElementById("redraw");

// redrawBtn.addEventListener("click", function() {
// 	redraw();
// });



// var sizeChangeBtn = document.getElementById("change-brush-size");

// sizeChangeBtn.addEventListener("click", function() {
// 	context.lineWidth =  document.getElementById("brushSize").value;
// });

// var colorChangeBtn = document.getElementById("change-color");

// colorChangeBtn.addEventListener("click", function() {
// 	context.strokeStyle = "blue";
// 	console.log("color changed to");
// });