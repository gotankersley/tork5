#include <iostream>
#include <ctime>
#include "board.h"
using namespace std;

void main()
{
	srand((unsigned int) time(0));
	Board board;
	board.print();
	cout << board.toString() << endl;

	system("PAUSE");
}