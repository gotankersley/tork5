var BITS_PER_BYTE = 4;

//Init
$(function() {    
    $('.quad td').click(onToggleSpot);
    $('#inputBoard').keyup(onKeyUp); 
    addRowColTitleHover();
    calculate();
});

function addRowColTitleHover() {
    $('.quad td').each(function() {
        var pos = $(this).html();
        $(this).attr('title',ROW[pos] + ',' + COL[pos]);
    });
}

//Event callbacks
function onKeyUp(e) {
    if (e.keyCode == 13) setBoard(); //Enter        
}

function setBoard() {
    $('.active').removeClass('active');
    var input = $("#inputBoard").val();
    var bitStr;
    
    //Don't need to convert if already binary
    if (input.length == BOARD_SPACES) bitStr = input;
    else //Either decimal or hex
    {
        bitStr = parseInt(input).toString(2);
        bitStr = padStr(bitStr, BOARD_SPACES);    
    }
    
    $('.quad td').each(function(){ 
        var pos = $(this).html();
        if (bitStr.charAt(BOARD_SPACES - pos - 1) == '1') $(this).addClass('active');
    });
    calculate();  
}
function resetBoard() {
    $('.active').removeClass('active');
    $('#inputBoard').html();
    calculate();
}

function onToggleSpot(e) {   
    var spot = $(this);
    if (spot.hasClass('active')) spot.removeClass('active');
    else spot.addClass('active');
    calculate();    
}


//Conversion functions
function calculate() {    
    var bitStr = padStr('', BOARD_SPACES);
    $('.quad .active').each(function(){    
        var pos = $(this).html();
        bitStr = setChar(bitStr, (BOARD_SPACES - pos - 1), 1);
    });
    $('#outBin').html(bitStr);
    $('#outHex').html(toHex(bitStr, BOARD_SPACES));
}

function toHex(bitStr, length) {
    //Convert to hex 4 bits at a time
    var hex = '';
    for (var i = 0; i < bitStr.length; i+= BITS_PER_BYTE) {
        var bits = parseInt(bitStr.substr(i, BITS_PER_BYTE), 2);
        hex += bits.toString(16);        
    }    
	var hexStr = '0x';	
	for (var i = 0; i < hex.length; i++) {
		if (hex.charAt(i) != 0) return '0x' + hex.substr(i);
	}
	
	return '0x' + hex;
}

//String functions
function setChar(str, index, val) {
    return str.substr(0, index) + val + str.substr(index + 1);
}

function padStr(str, length) {
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}
