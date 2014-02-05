var AVAIL_WINS = [
	[0x607,0x6c1,0x1807,0x18007,0x20400c1,0x2040007,0x1800c1,0x18000c1,0x808000111,0x820000111,0xa00000111],// 0
	[0xe06,0x3806,0x18206,0x607,0x1807,0x18007,0x4080122,0x4200122,0x6000122,0x5000800a,0x50008082,0x14000800a,0x41000800a],// 1
	[0xe06,0x3806,0x18206,0x607,0x61c,0x1807,0x18007,0x30001c,0x300007,0xc0001c,0xc001c],// 2
	[0x31108,0x24508,0x30188,0x20588,0x24188,0x700018,0x1c00018,0x1c0018,0x30001c,0xc0001c,0xc001c,0x5000800a,0x50008028,0x14000800a,0x41000800a],// 3
	[0xe030,0x18230,0x3830,0xc070,0xc01c,0x10270,0x3070,0x700018,0x1c00018,0x1c0018,0x30001c,0x300070,0xc0001c,0xc001c,0x888000110,0xa20000110,0x808000111,0x820000111,0xa00000111,0x2090410,0x2081410,0x2094010,0x290410,0x2810410],// 4
	[0xe030,0x18230,0x3830,0xc070,0x10270,0x3070,0x4880120,0x6200120,0x4080122,0x4200122,0x6000122,0x5001000a0,0x500100028,0x4101000a0,0x1401000a0],// 5
	[0xc070,0xc0c1,0x10270,0x3070,0x30400c0,0x1c00c0,0x1c000c0,0x20400c1,0x2040070,0x1800c1,0x18000c1],// 6
	[0x30188,0x20588,0x24188,0x30400c0,0x1c00c0,0x1c000c0,0x20400c1,0x1800c1,0x18000c1,0x5001000a0,0x500100082,0x4101000a0,0x1401000a0],// 7
	[0x31108,0x31120,0x31102,0x24508,0x30188,0x30122,0x20588,0x24188,0x4880120,0x4880180,0x4880108,0x6200120,0x4080122,0x4080188,0x4200122,0x6000122,0x888000110,0x888000140,0x888000104,0xa20000110,0x808000111,0x808000144,0x820000111,0xa00000111],// 8
	[0xe06,0xe18,0xe81,0x18206,0x607,0x61c,0x6c1,0x408018200,0x408000e00,0x30018200,0x300018200],// 9
	[0xe06,0xe18,0xe81,0x607,0x61c,0x6c1,0x810024400,0x840024400,0xc00024400,0x2090410,0x2081410,0x290410,0x2810410],// 10
	[0xe06,0xe18,0xe81,0x3806,0x60003800,0x60000e00,0x180003800,0x18003800,0x4128800,0x4428800,0x4068800],// 11
	[0x31108,0x31120,0x31102,0xe0003000,0x380003000,0x38003000,0x60003800,0x180003800,0x18003800,0x8a05000,0x8a01400,0xa805000,0x8285000],// 12
	[0xe030,0xe0c0,0xe00c,0x3830,0xe0003000,0x380003000,0x38003000,0x60003800,0x6000e000,0x180003800,0x18003800],// 13
	[0xe030,0xe0c0,0xe00c,0xc070,0xc0c1,0xc01c,0x910024000,0xc40024000,0x810024400,0x840024400,0xc00024400,0x8a05000,0x8a14000,0xa805000,0x8285000],// 14
	[0xe030,0xe0c0,0xe00c,0x18230,0xc070,0xc0c1,0xc01c,0x608018000,0x38018000,0x380018000,0x408018200,0x40800e000,0x30018200,0x300018200,0x5000800a,0x50008028,0x50008082,0x14000800a,0x41000800a,0x5128000,0x4468000,0x4128800,0x4428800,0x4068800],// 15
	[0x31108,0x31120,0x31102,0x30188,0x30122,0x608018000,0x38018000,0x380018000,0x408018200,0x30018200,0x300018200,0x2090410,0x2094010,0x290410,0x2810410],// 16
	[0x31108,0x31120,0x31102,0x24508,0x30188,0x30122,0x20588,0x24188,0x910024000,0x910030000,0x910021000,0xc40024000,0x810024400,0x810031000,0x840024400,0xc00024400,0x5128000,0x5120200,0x5122000,0x4468000,0x4128800,0x4122200,0x4428800,0x4068800],// 17
	[0x181c0000,0x1b040000,0x601c0000,0x6001c0000,0x30400c0,0x3040003,0x3040030,0x1c00c0,0x20400c1,0x2040007,0x2040070],// 18
	[0x38180000,0xe0180000,0x608180000,0x181c0000,0x601c0000,0x6001c0000,0x4880120,0x4880180,0x4880108,0x4080122,0x4080188,0x2090410,0x2081410,0x2094010,0x290410],// 19
	[0x38180000,0xe0180000,0x608180000,0x181c0000,0x18700000,0x601c0000,0x6001c0000,0x700018,0x700060,0x700006,0x1c0018,0x30001c,0x300070,0x300007,0x5001000a0,0x500100082,0x500100028,0x4101000a0,0x1401000a0,0x5128000,0x5120200,0x5122000,0x4128800,0x4122200],// 20
	[0xc44200000,0x914200000,0xc06200000,0x816200000,0x906200000,0x700018,0x700060,0x700006,0x30001c,0x300070,0x300007,0x8a05000,0x8a14000,0x8a01400,0x8285000],// 21
	[0x380c00000,0x608c00000,0xe0c00000,0x301c00000,0x300700000,0x409c00000,0xc1c00000,0x700018,0x700060,0x700006,0x1c00018],// 22
	[0x380c00000,0x608c00000,0xe0c00000,0x301c00000,0x409c00000,0xc1c00000,0x4880120,0x4880180,0x4880108,0x8a05000,0x8a14000,0x8a01400,0xa805000],// 23
	[0x301c00000,0x303040000,0x409c00000,0xc1c00000,0x30400c0,0x3040003,0x3040030,0x1c000c0,0x5128000,0x5120200,0x5122000],// 24
	[0xc06200000,0x816200000,0x906200000,0x30400c0,0x3040003,0x3040030,0x20400c1,0x2040007,0x2040070,0x2090410,0x2081410,0x2094010,0x2810410],// 25
	[0xc44200000,0xc44800000,0xc44080000,0x914200000,0xc06200000,0xc04880000,0x816200000,0x906200000,0x4880120,0x4880180,0x4880108,0x6200120,0x4080122,0x4080188,0x4200122,0x6000122,0x5128000,0x5120200,0x5122000,0x4468000,0x4128800,0x4122200,0x4428800,0x4068800],// 26
	[0x38180000,0x38600000,0x3a040000,0x608180000,0x181c0000,0x18700000,0x1b040000,0x608018000,0x608000600,0x608006000,0x38018000,0x408018200,0x408000e00,0x40800e000,0x888000110,0x888000140,0x888000104,0x808000111,0x808000144,0x8a05000,0x8a14000,0x8a01400,0xa805000,0x8285000],// 27
	[0x38180000,0x38600000,0x3a040000,0x181c0000,0x18700000,0x1b040000,0x910024000,0x910030000,0x910021000,0x810024400,0x810031000,0x5000800a,0x50008028,0x50008082,0x41000800a],// 28
	[0x38180000,0x38600000,0x3a040000,0xe0180000,0xe0003000,0xe000c000,0xe0000c00,0x38003000,0x60003800,0x6000e000,0x60000e00],// 29
	[0xc44200000,0xc44800000,0xc44080000,0xe0003000,0xe000c000,0xe0000c00,0x60003800,0x6000e000,0x60000e00,0x5000800a,0x50008028,0x50008082,0x14000800a],// 30
	[0x380c00000,0x383000000,0x380300000,0xe0c00000,0xe0003000,0xe000c000,0xe0000c00,0x380003000,0x888000110,0x888000140,0x888000104],// 31
	[0x380c00000,0x383000000,0x380300000,0x301c00000,0x303040000,0x300700000,0x910024000,0x910030000,0x910021000,0x5001000a0,0x500100082,0x500100028,0x1401000a0],// 32
	[0x380c00000,0x383000000,0x380300000,0x608c00000,0x301c00000,0x303040000,0x300700000,0x608018000,0x608000600,0x608006000,0x380018000],// 33
	[0xc44200000,0xc44800000,0xc44080000,0xc06200000,0xc04880000,0x608018000,0x608000600,0x608006000,0x408018200,0x408000e00,0x40800e000,0x5001000a0,0x500100082,0x500100028,0x4101000a0],// 34
	[0xc44200000,0xc44800000,0xc44080000,0x914200000,0xc06200000,0xc04880000,0x816200000,0x906200000,0x910024000,0x910030000,0x910021000,0xc40024000,0x810024400,0x810031000,0x840024400,0xc00024400,0x888000110,0x888000140,0x888000104,0xa20000110,0x808000111,0x808000144,0x820000111,0xa00000111]// 35
];