function Message(header, sender, body) {
	this.header = header;
	this.sender = sender;
	this.body = body;
}

Message.prototype.construct = function(first_argument) {
	// body...
};