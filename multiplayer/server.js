http://stackoverflow.com/questions/19156636/node-js-and-socket-io-creating-room
var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');

app.listen(8080);

//Page server
function handler (req, res) {
	var url = req.url;
	if (url == '/') url = '/game.html';
		
	fs.readFile(url.substring(1), function(error, data){
		if (error) {
			res.writeHead(500);
			return res.end('Error loading ' + url);
		}
		if (url.lastIndexOf('.js') == url.length - 3) //js mime type
			res.setHeader('Content-Type', 'application/javascript');
		else if (url.lastIndexOf('.css') == url.length - 4) //css mime type
			res.setHeader('Content-Type', 'text/css');
		else res.setHeader('Content-Type', 'text/html');	
		res.writeHead(200);
		res.end(data);
	});

}

//Sockets
var lobbyNames = {};
io.sockets.on('connection', function (socket) {	
	socket.on('add-player', function(username) {
        username = sanitize(username);
        socket.username = username;        
        socket.room = 'lobby';        
        lobbyNames[username] = socket.id;
        socket.join('lobby');
        socket.emit('update-players', Object.keys(lobbyNames));		        
        socket.broadcast.to('lobby').emit('update-players', Object.keys(lobbyNames));        
    });

	socket.on('disconnect', function() {			
		if (typeof(socket.oppId) != 'undefined') {
			var otherSocket = io.sockets.socket(socket.oppId);
			otherSocket.emit('disconnect');
		}
		else { //Lobby
			delete lobbyNames[socket.username];
			io.sockets.emit('update-players', Object.keys(lobbyNames));
			socket.leave(socket.room);
		}
	});
	
	socket.on('send-chat', function(data) {	
		if (typeof(lobbyNames[socket.username]) != 'undefined')
			io.sockets.in('lobby').emit('update-chat', data);         
		else {
			var otherSocket = io.sockets.socket(socket.oppId);
			otherSocket.emit('update-chat', data);
			socket.emit('update-chat', data);
		}
    });
		
	socket.on('invite', function(data) {
		var otherSocket = io.sockets.socket(lobbyNames[data.opp]);
		otherSocket.emit('invite-received', data);
		
	});
	
	socket.on('invite-response', function(data) {
		var otherSocket = io.sockets.socket(lobbyNames[data.username]);
		if (data.willPlay) {
			otherSocket.leave('lobby');
			socket.leave('lobby');
			otherSocket.emit('start-game', {id:0, start:data.start, oppName:socket.username});
			socket.emit('start-game', {id:1, start:data.start, oppName:otherSocket.username});
            socket.oppId = otherSocket.id;
            otherSocket.oppId = socket.id;
            delete lobbyNames[socket.username];
            delete lobbyNames[otherSocket.username];
            socket.broadcast.to('lobby').emit('update-players', Object.keys(lobbyNames));
		}
		else otherSocket.emit('invite-rejected', {});
	});
	
    socket.on('place-pin', function(data) {
        var oppId = socket.oppId;
        var otherSocket = io.sockets.socket(oppId);
        otherSocket.emit('pin-placed', data);
    });
    
    socket.on('rotate-quad', function(data) {
        var oppId = socket.oppId;
        var otherSocket = io.sockets.socket(oppId);
        otherSocket.emit('quad-rotated', data);
    });
});

function sanitize(str) {
    if (typeof(str) == 'undefined' || !str) return '-';
    return str.replace(/[^\w]/gi,'-');
}