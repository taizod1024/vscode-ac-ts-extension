package main

import (
	"fmt"
)

func main() {

	// TODO edit this code, this code is for https://atcoder.jp/contests/practice/tasks/practice_1

	// param
	var a int
	var b, c int
	var s string
	fmt.Scanf("%d\n", &a)
	fmt.Scanf("%d %d\n", &b, &c)
	fmt.Scanf("%s\n", &s)

	// answer
	fmt.Printf("%d %s\n", a+b+c, s)
}
