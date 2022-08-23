import java.util.Scanner;

public class template {

  public static void main(String[] args) {

    // TODO edit this code, this code is for
    // https://atcoder.jp/contests/practice/tasks/practice_1

    // param
    Scanner sc = new Scanner(System.in);
    int a = Integer.parseInt(sc.next());
    int b = Integer.parseInt(sc.next());
    int c = Integer.parseInt(sc.next());
    String s = sc.next();
    sc.close();

    // resolve
    int ans = a + b + c;

    // answer
    System.out.println(ans + " " + s);
  }

}