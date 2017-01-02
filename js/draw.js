var cv = $("canvas");
cv.css({"border-color": "#C1E0FF", 
	"border-width":"1px", 
	"border-style":"solid"});

var context = document.getElementById("canvas").getContext("2d");
context.canvas.width = 900;
context.canvas.height = 600;
context.strokeStyle = "#FF0000";

// if mouse is pressed
var paint = false;

var strokeNum = -1;
var strokes = [];
var futureStrokes = [];

function addClick(x, y, dragging) {
	strokes[strokeNum].push({x: x, y: y, lineWidth: context.lineWidth, strokeStyle: context.strokeStyle});
}

function redraw() {
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	context.strokeStyle = "#000000";
	context.lineJoin = "round";
	context.lineWidth = 5;

	// loop through each individual brush stroke
	for (var i = 0; i < strokes.length; i++) {
		// loop through each pixel per brush stroke
		for (var j = 0; j < strokes[i].length; j++) {
			// if pixel is just dot...
			if (j == 0) {
				context.strokeRect(strokes[i][0].x, strokes[i][0].y, 1, 1);
				context.lineWidth = strokes[i][0].lineWidth;
				context.strokeStyle = strokes[i][0].strokeStyle;
			} else {
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

function addStroke(arr) {
	strokeNum ++;
	strokes.push(arr);

	futureStrokes = [];
}

function undoStroke() {
	if (strokes.length > 0) {
		futureStrokes.push(strokes.splice(strokeNum, 1)[0]);
		strokeNum --;
	}
}

function redoStroke() {
	if (futureStrokes.length > 0) {
		strokes.push(futureStrokes.splice(futureStrokes.length - 1, 1)[0]);
		strokeNum ++;
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


	addStroke([]);

	paint = true;
	addClick(mouseX, mouseY, true);
	redraw();
});


// if mouse is dragged
$("#canvas").mousemove(function(e) {
	if (paint) {
		addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
		redraw();
	}
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



var sizeChangeBtn = document.getElementById("change-brush-size");

sizeChangeBtn.addEventListener("click", function() {
	context.lineWidth =  document.getElementById("brushSize").value;
});

var colorChangeBtn = document.getElementById("change-color");

colorChangeBtn.addEventListener("click", function() {
	context.strokeStyle = document.getElementById("color").value;
});