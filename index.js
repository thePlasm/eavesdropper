var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

var previd = '';
var prevmessage = '';

var stimuli = JSON.parse(fs.readFileSync('stimuli.json')).stimuli;

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

function stexists() {
	for (a = 0; a < stimuli.length; a++) {
		if (stimuli[a].stimulus == prevmessage) {
			return [true, a];
		}
	}
	return [false];
}

function reexists(a, mes) {
	for (b = 0; b < stimuli[a].responses.length; b++) {
		if (stimuli[a].responses[b].response == mes) {
			return [true, b];
		}
	}
	return [false];
}

io.on('connection', function(socket){
	socket.on('chat message', function(msg){
		if (previd != socket.id) {												//start of AI code
			if (prevmessage != '') {											//check to see if it is a response
				if (stexists()[0]) {											//is an existing stimulus
					stindex = stexists()[1];
					if (reexists(stindex, msg)[0]) {							//is an existing response
						reindex = reexists(stindex, msg)[1];
						stimuli[stindex].responses[reindex].frequency++;
					}
					else {														//new response
						stimuli[stindex].responses.push({
							response: msg,
							frequency: 1
						});
					}
				}
				else {															//new stimulus
					stimuli.push({
						stimulus: prevmessage,
						responses: [
							{
								response: msg,
								frequency: 1
							}
						]
					});
				}
			}
		}																		//end of AI code
		io.emit('chat message', msg);
		prevmessage = msg;
		previd = socket.id;
		fs.writeFileSync('stimuli.json', JSON.stringify({stimuli: stimuli}))
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});
