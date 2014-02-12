#include <iostream>
#include "board.h"
using namespace std;

void main()
{
	Board board;
	board.print();
	cout << board.toString() << endl;

	system("PAUSE");
}