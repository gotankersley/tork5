$(function() {
	//Dynamically populate player selection menus
    for (var i in PLAYERS) {		
		if (i != PLAYER_HUMAN) {
			$('.player').append('<option value="' + i + '">' + PLAYERS[i] + '</option>');
		}
    }    
    // $('.player').change(function() {
        // var playerNum = ($(this).attr('id') == 'player1')? PLAYER1 : PLAYER2;
        // var playerType = Number($(this).val());
        // game.player.set(playerNum, playerType);
		// game.player.play();
    // });
	
});