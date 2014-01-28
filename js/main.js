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
        if ($(this).attr('name') == 'speed') OPTION_ROT_SPEED = opt;
        else if (opt == 0) OPTION_ROT_ANIM = !OPTION_ROT_ANIM;
        else if (opt == 1) OPTION_ROW_NUMBERS = !OPTION_ROW_NUMBERS;
        else if (opt == 2) OPTION_ROW_NOTATION = !OPTION_ROW_NOTATION;
        else if (opt == 3) {
            OPTION_FIND_WINS = !OPTION_FIND_WINS;
            $('#find-wins').toggle();
        }        
        
    });
});