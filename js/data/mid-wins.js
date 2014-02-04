var MID_WINS = [ //Used to guarantee count win count is contiguous
    0x606,0x30108,0xc030,0x18180000,0xc04200000,0x300c00000, //Horizontal
    0x20400c0,0x4080120,0x300018,0x408018000,0x810024000,0x60003000, //Vertical    
    0x10008008,0x808000110,0x400100020, //Diagonal tl -> br
    0x90010,0x4128000,0x8204000 //Diagonal tr->bl
];

var SPAN_WINS = [ //These each span 6 spaces, and are used with the mids to optimize win checking
    0x801,0x1080,0x2040,0x20040000,0x42000000,0x81000000, //Horizontal
    0x1000001,0x800002,0x400004,0x200000200,0x100000400,0x80000800, //Vertical    
    0x40000002,0x80000001,0x100000080, //Diagonal top-left to bottom-right
    0x2000400,0x1000800,0x801000 //Diagonal top-right to bottom-left
];

