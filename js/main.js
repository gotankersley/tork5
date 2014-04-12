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
		else if ($(this).attr('name') == 'abdepth') {
			if (opt <= 0) opt =1;
			else if (opt > 3) {
				alert('Maximum depth is 3');
				opt = 3;
			}
			ALPHA_BETA_MAX_DEPTH = opt;
		}
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