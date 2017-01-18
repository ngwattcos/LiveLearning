// create a standard form of communication with the server
// every Message has header, sender, and body fields
// a header reflects the type of request
// a sender identifies the sender by a unique client id
// a "body" can be used to store any additional data
function Message(header, sender, body) {
	this.header = header;
	this.sender = sender;
	this.body = body;
}

// placeholder for any future properties of a Message class
Message.prototype.construct = function(first_argument) {
	// body...
};