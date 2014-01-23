var MID_WINS = [ //Used to guarantee count win count is contiguous
    0x20400c0,0x4080120,0x300018,0x408018000,0x810024000,0x60003000, //Vertical
    0x606,0x30108,0xc030,0x18180000,0x4200000,0x300c00000, //Horizontal
    0x5000800a,0x808000110,0x5001000a0, //Diagonal tl -> br
    0x2090410,0x4128000,0x8a05000 //Diagonal tr->bl
];

var SPAN_WINS = [ //These each span 6 spaces, and are used with the mids to optimize win checking
    0x30400c1,0x4880122,0x70001c,0x608018200,0x910024400,0xe0003800, //Vertical
    0e07x,0x31188,0xe070,0x381c0000,0xc46200000,0x381c00000, //Horizontal
    0x5000800a,0x888000111,0x5001000a0, //Diagonal top-left to bottom-right
    0x2090410,0x5128800,0x8a05000 //Diagonal top-right to bottom-left
];

