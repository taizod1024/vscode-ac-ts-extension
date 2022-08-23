#include <stdio.h>
#include <iostream>

int main()
{
    // TODO edit this code, this code is for https://atcoder.jp/contests/practice/tasks/practice_1

    // param
    int a;
    int b;
    int c;
    char s[101];
    std::cin >> a >> b >> c >> s;

    // solve
    int ans = a + b + c;

    // answer
    std::cout << ans << " " << s;

    return 0;
  }