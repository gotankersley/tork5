var socket = io.connect('http://ad-gotankersley.harding.edu:8080');
var username;
do username = clean(prompt('Username: '));
while (!username);
var game;
$(document).on('click', '#players li', selectPlayer);


//Events
socket.on('connect', function () {
	socket.emit('add-player', username);	
});

socket.on('update-chat', function (data) {	
    var user = clean(data.username);
    var text = clean(data.text);
	$('#chatBox').append('<p><b>' + user + ':</b> ' + text + '</p>');
});

socket.on('update-players', function (players) {	
	var list = $('#players');
	list.empty();
    if (players.length == 1) list.append('<li>waiting for players...</li>');
	else {
        for (var i = 0; i < players.length; i++) {
            if (players[i] == username) continue;
            list.append('<li>' + players[i] + '</li>');
        }	
    }
});

socket.on('invite-received', function(data) {
    var user = clean(data.username);
	data.willPlay = confirm('Play game with ' + user + '?');
	socket.emit('invite-response', data);
});
	

socket.on('invite-rejected', function(data) {
	alert('Invite rejected');
});

socket.on('start-game', function (data) {    
	$('body').html(
		'<div id="options">' + 
		'<div id="options-button">Settings</div>' + 
		'<div id="options-menu">' +
		'<label><input type="checkbox" class="game-option" value="1" checked="checked"/>Row numbers</label><br>' +
		'<label><input type="checkbox" class="game-option" value="0" checked="checked"/>Rotation animation</label><br>' +
		'<label>Rotate speed: <input type="input" name="speed" size="8" class="game-option" value="1"/></label><br>' +
		'</div>' +
		'</div>' +	
		
		'<div id="game-chat">' + 
		'<h3>Chat</h3>' +
		'<div id="chatBox"></div>' +
		'<textarea id="chatInput"></textarea><br/>' +
		'<button onclick="sendChat();">Send</button>' +
		'</div>' +
		'<canvas id="mainCanvas" width="800" height="800"></canvas>' +
		'<div id="status"></div>'
	);
	
	var side;
	if (data.start == START_FIRST) side = (data.id == 0)? PLAYER1 : PLAYER2;
	else if (data.start == START_SECOND) side = (data.id == 0)? PLAYER2 : PLAYER1;
	else side = Math.floor(Math.random() * 2);
	game = new Game(side, username, data.oppName);	
});

socket.on('pin-placed', function (data) {    
    var pos = data.pos;
    var tmpBoard = game.board.clone();
    tmpBoard.setPin(pos);    
    if (tmpBoard.toString() == data.board) {
        game.onPlacePin(ROW[pos], COL[pos], false);
    }
    else {
        alert('invalid');
        console.log(data);
    }
});

socket.on('quad-rotated', function (data) {    
    game.onRotateStart(data.quad, data.rot, false);
});

socket.on('disconnect', function () {    
    alert ('Opponent has disconnected');
});


//Actions
function selectPlayer() {	
	$('.selected-player').removeClass('selected-player');
	$(this).addClass('selected-player');
}

function sendChat() {
	var text = $('#chatInput').val();
	$('#chatInput').val('');
	socket.emit('send-chat', {username:username, text:text});
}

function sendInvite() {	
	var player = $('.selected-player').text();
	var start = $('.playFirst:checked').val();
	socket.emit('invite', {username: username, opp:player, start:start});
}

function clean(str) { //Basic sanitizer - Could be improved
    if (typeof(str) == 'undefined' || !str) return false;
    return str.replace(/[^\w\!\@\#\$%\^\&\*\(\)\.,\? ]/gi,'-');    
}
