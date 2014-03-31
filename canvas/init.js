$(function() {    
	game = new Game();	
    
    $("#options-button").click(function() {
        var button = $('#options-button');
        if (button.hasClass('options-menu-down')) button.removeClass('options-menu-down');
        else button.addClass('options-menu-down');
        $("#options-menu").slideToggle();
    });
    
    $('.game-option').change(function() {
        var opt = $(this).val();
        if ($(this).attr('name') == 'speed') SETTING_ROT_SPEED = opt;
        else if (opt == 0) SETTING_ROT_ANIM = !SETTING_ROT_ANIM;
        else if (opt == 1) SETTING_ROW_NUMBERS = !SETTING_ROW_NUMBERS;
        else if (opt == 2) SETTING_ROW_NOTATION = !SETTING_ROW_NOTATION;
        else if (opt == 3) {
            SETTING_FIND_WINS = !SETTING_FIND_WINS;
            $('#find-wins').toggle();
        }        
        
    });
    
    //Dynamically populate player selection menus
    for (var i in PLAYERS) {
        $('.player').append('<option value="' + i + '">' + PLAYERS[i] + '</option>');
    }    
    $('.player').change(function() {
        var playerNum = ($(this).attr('id') == 'player1')? PLAYER1 : PLAYER2;
        var playerType = Number($(this).val());
        game.player.set(playerNum, playerType);
		game.player.play();
    });	
});

Game.prototype.showFindWins = function() {
	//Three ways to win
	//1. Can win just by rotation
	//2. Can with by placing a pin with no rotation
	//3.. Can win by placing a pin and rotating        
    var wins = this.board.findAllWins();
    $('#find-wins-text').html('');
    
	for (var side in wins) {
		var sideWins = wins[side];	
		var winStr = '';
		for (var winId in sideWins) {
			var winInfo = sideWins[winId];
						
			var space = (winInfo.pos == INVALID)? '&lt;any&gt;' : (ROW[winInfo.pos] + ',' + COL[winInfo.pos]); 		
			
			var quad = (winInfo.quad == INVALID)? '' : (' - Q' + winInfo.quad);
			
			var rot;
			if (winInfo.rot == INVALID) rot = '';
			else if (winInfo.rot == ROT_CLOCKWISE) rot = ' Clockwise';
			else if (winInfo.rot == ROT_ANTICLOCKWISE) rot = ' Anti-clockwise';		
			
			winStr += '<div>' + space + quad + rot + '</div>';
		}	
		var color = (side == PLAYER1)? COLOR_P1 : COLOR_P2;			
		$('#find-wins-text').append('<div style="color: ' + color + '">' + winStr + '</div>');
	}
	
}