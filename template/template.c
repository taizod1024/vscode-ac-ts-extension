#include <stdio.h>

int main(void)
{
    /* TODO edit this code, this code is for https://atcoder.jp/contests/practice/tasks/practice_1 */

    /* param */
    int a;
    int b;
    int c;
    char s[101];
    scanf("%d\n%d %d\n%s", &a, &b, &c, s);

    /* solve */
    int ans = a + b + c;

    /* answer */
    printf("%d %s", ans, s);

    return 0;
}