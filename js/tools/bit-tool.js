var BOARD_SPACES = 36;
var BITS_PER_BYTE = 4;
var ROW = [0,0,0,1,2,2,2,1,1,0,0,0,1,2,2,2,1,1,3,3,3,4,5,5,5,4,4,3,3,3,4,5,5,5,4,4];
var COL = [0,1,2,2,2,1,0,0,1,3,4,5,5,5,4,3,3,4,0,1,2,2,2,1,0,0,1,3,4,5,5,5,4,3,3,4];
var IND = [
    [0,1,2,9,10,11],        //Row 0
    [7,8,3,16,17,12],       //Row 1
    [6,5,4,15,14,13],       //Row 2
    [18,19,20,27,28,29],    //Row 3
    [25,26,21,34,35,30],    //Row 4
    [24,23,22,33,32,31],    //Row 5
];


//Init
$(function() {    
    $('.quad td').click(onToggleSpot);
    $('#inputBoard').keyup(onKeyUp); 
    addRowColTitleHover();
    calculate();
});

function addRowColTitleHover() {
    $('.quad td').each(function() {
        var ind = $(this).html();
        $(this).attr('title',ROW[ind] + ',' + COL[ind]);
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
        var ind = $(this).html();
        if (bitStr.charAt(BOARD_SPACES - ind - 1) == '1') $(this).addClass('active');
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
        var ind = $(this).html();
        bitStr = setChar(bitStr, (BOARD_SPACES - ind - 1), 1);
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
