# AtCoder Extension

C/C++/Java/Python/Go/JavaScript/TypeScript での [AtCoder](https://atcoder.jp/?lang=ja)/[Yukicoder](https://yukicoder.me/) への参加をサポートする Visual Studio Code の拡張機能です。

## 変更

- 2022/12/08
  - 機能強化
    - <span style="font-weight:bold">Linux でのデバッグ実行に対応しました。</span>
      - <span style="color:red;font-weight:bold">問題があれば連絡願います。</span>
      - 現時点でデバッグ実行に対応していないのは Windows/Linux ともに Go だけです。
- 2022/12/04
  - 機能強化
    - <span style="font-weight:bold">Windows での Java/C/C++のデバッグ実行に対応しました。</span>
      - C/C++はデバッグ実行のためコンパイルオプションに"-g"を追加しています。
      - 現時点では Go のみデバッグ実行に対応していません。
      - Linux は未検証のためエラーにしています。
- 2022/08/29
  - 機能強化
    - <span style="font-weight:bold">Go に対応しました。</span>
    - <span style="font-weight:bold">ローカルでタスクを登録できるようにしました。</span>
      - 競技プログラミングサイトに関係なく問題を登録することができます。
- 2022/08/24
  - 機能強化
    - <span style="font-weight:bold">Linux 環境に対応しました。</span>
    - <span style="font-weight:bold">任意の言語に対応しました。</span>
      - 設定の"User1"に対して以下を参考に設定します。
        - 拡張子、例：`.bat`
        - チェックコマンド、例：`cmd /c`
        - コンパイルコマンド、例：空文字列
        - 実行コマンド、例：`$taskfile`
      - パラメタを拡張しました。
        - `$site`, `$contest`, `$task`, `$extension`

## 機能

C/C++/Java/Python/Go/JavaScript/TypeScript での Visual Studio Code から AtCoder/Yukicoder への参加をサポートします。

- AtCoder/Yukicoder へのログイン
- C/C++/Java/Python/Go/JavaScript/TypeScript のソースコードの生成
- テストデータのダウンロード
- 解答のテスト実行、デバッグ実行
- 解答の提出
- ブラウザでの問題ページの表示

![testtask](https://github.com/taizod1024/ac-ts-extension/blob/main/images/testtask.gif?raw=true)

## 制限

- マルチルートワークスペースには対応していません。
- Linux でのデバッグ実行はサポートしていません。
- Python/JavaScript/TypeScript のデバッグ実行時は以下の場合の NG 判定ができません。
  - 戻り値が 0 以外による NG 判定
  - 例外が発生したことによる NG 判定

## 動作確認環境

- Windows
  - Windows 10 (21H2)
  - Visual Studio Code (1.70.2)
  - [x] C (mingw 11.2.0.07112021) 実行＋デバッグ
  - [x] C++ (mingw 11.2.0.07112021) 実行＋デバッグ
  - [x] Java (AdoptOpenJDKjre 16.0.1.901) 実行＋デバッグ
  - [x] Python (3.10.6) 実行＋デバッグ
  - [x] Go (1.19) 実行のみ
  - [x] JavaScript (Node.js 16.13.0) 実行＋デバッグ
  - [x] TypeScript (Node.js 16.13.0) 実行＋デバッグ
- Linux
  - Ubuntu (WSL2)
  - [x] C (gcc (Ubuntu 9.4.0-1ubuntu1~20.04.1) 9.4.0) 実行＋デバッグ
  - [x] C++ (g++ (Ubuntu 9.4.0-1ubuntu1~20.04.1) 9.4.0) 実行＋デバッグ
  - [x] Java (openjdk version "1.8.0_342") 実行＋デバッグ
  - [x] Python (Python 3.8.5) 実行＋デバッグ
  - [x] Go (go version go1.13.8 linux/amd64) 実行のみ
  - [x] JavaScript (Node.js 12.22.12) 実行＋デバッグ
  - [x] TypeScript (Node.js 12.22.12) 実行＋デバッグ

## 準備

[AtCoder](https://atcoder.jp/?lang=ja) および [Yukicoder](https://yukicoder.me/) でユーザ登録します。Yukicoder の場合はプロフィール画面の API キーを確認しておいてください。

### vscode

vscode の [拡張機能] から `AtCoder Extension` を検索してインストールします。

### C/C++/Java

gcc/g++/clang/jdk 等をインストールします。  
環境に合わせて設定からコマンドを変更します。

### Python

[Python](https://www.python.org/) をインストールします。

### Go

[Go](https://go.dev/) をインストールします。

### JavaScript

[Node.js](https://nodejs.org/ja/) をインストールしてから TypeScript の初期設定をします。

1. vscode の [ファイル] > [フォルダを開く] からフォルダを選択します。
2. [ターミナル] > [新しいターミナル] から以下のコマンドを実行します。入力を求められたらすべて Enter キーを押して進めてください。
   ```shell
   npm init
   ```

### TypeScript

[Node.js](https://nodejs.org/ja/) をインストールしてから TypeScript の初期設定をします。

1. vscode の [ファイル] > [フォルダを開く] からフォルダを選択します。
2. [ターミナル] > [新しいターミナル] から以下のコマンドを実行します。入力を求められたらすべて Enter キーを押して進めてください。
   ```shell
   npm init
   npm install --save-dev typescript ts-node @types/node
   ```

![npminit](https://github.com/taizod1024/ac-ts-extension/blob/main/images/npminit.gif?raw=true)

## 使い方

vscode で `F1` を押下（もしくは [表示] > [コマンド パレット] を選択、`Ctrl+Shift+P` を押下）して [コマンド パレット] から機能を選択します。

### AtCoder/Yukicoder へログインする

はじめに `AtCoder Extension: Login Site` でユーザ名とパスワードを入力して AtCoder にログインします。
Yukicoder の場合はプロフィール画面の API キーを入力します。

![loginsite](https://github.com/taizod1024/ac-ts-extension/blob/main/images/loginsite.gif?raw=true)

### 問題をはじめる

まずはじめに `AtCoder Extension: Init Task` で問題名を入力して提出用のソースコードの生成と問題用のテストデータのダウンロードをします。

- サイトを`atcoder`,`yukicoder`から選択します。
- コンテスト名は AtCoder の場合は `abc190`の形式、Yukicoder の場合は`351`の形式で入力します。いずれも URL から確認してください。
- 問題名は AtCoder の場合は `abc190_a` の形式、Yukicoder の場合は`1692`の形式で入力します。いずれも URL から確認してください。
- 解答する言語は`.py`,`.ts`, `.js` から選択します。
- ソースコードは `src/atcoder/abcXXX/abcXXX_X.ts` に生成されます。
- テストデータは `src/atcoder/abcXXX/abcXXX_X.txt` にダウンロードされます。
- フォルダは自動的に作成されます。
- 既にソースコードやテストデータがある場合はスキップされます。

![inittask](https://github.com/taizod1024/ac-ts-extension/blob/main/images/inittask.gif?raw=true)

### 問題に解答する

生成されたソースコードの main()を修正します。
ソースコードのひな型にカスタマイズしたい場合は、後述の[設定](#設定)を参照してください。

#### C ひな型

```c
#include <stdio.h>

int main(void)
{
  /* TODO edit this code */

  /* param */
  int n;
  scanf("%d", &n);

  /* solve */
  int ans;
  ans = n;

  /* answer */
  printf("%d", ans);

  return 0;
}
```

#### C++ ひな型

```C++
#include <stdio.h>
#include <iostream>

int main()
{
  /* TODO edit this code */

  /* param */
  int n;
  std::cin >> n;

  /* solve */
  int ans;
  ans = n;

  /* answer */
  std::cout << ans;

  return 0;
}
```

#### Java ひな型

```Java
import java.util.Scanner;

public class template {

  public static void main(String[] args) {

    // TODO edit this code

    // param
    Scanner sc = new Scanner(System.in);
    int n = Integer.parseInt(sc.next());
    sc.close();

    // resolve
    int ans = n;

    // answer
    System.out.println(ans);
  }

}
```

#### Python ひな型

```Python
# TODO edit this code

# param
n = int(input())

# solve
ans = n

# answer
print(ans)
```

#### Go ひな型

```Go
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
```

#### JavaScript ひな型

TypeScript と同様です。

#### TypeScript ひな型

```TypeScript
import * as fs from "fs";

// util for input
const lineit = (function* () { for (const line of fs.readFileSync(process.stdin.fd, "utf8").split("\n")) yield line.trim(); })();
const wordit = (function* () { while (true) { let line = lineit.next(); if (line.done) break; for (const word of String(line.value).split(" ")) yield word; } })();
const charit = (function* () { while (true) { let word = wordit.next(); if (word.done) break; for (const char of String(word.value).split("")) yield char; } })();
const readline = () => String((lineit.next()).value);
const read = () => String((wordit.next()).value);
const readchar = () => String((charit.next()).value);

// main
const main = function () {

    // TODO edit this code

    // param
    let n: number;

    // init
    n = Number(read());

    // solve
    let ans;

    // answer
    console.log(ans);

    return;

};
main();
```

### 問題の解答をテストする

問題の解答を作成したら、ソースコードを開いてから `AtCoder Extension: Test Task` でテスト実行します。

- 処理が 5 秒以上続くと自動的に中断します。
- 誤差が許容される問題の多くは NG になります。目視で判断してください。
- bigint での出力が必要な問題は文字列化して末尾の `n` を除去して出力してください。

![testtask](https://github.com/taizod1024/ac-ts-extension/blob/main/images/testtask.gif?raw=true)

テストデータの例です。テストデータを追加する場合は `--------` で区切って入力値・出力値を追加します。

```text
2 1 0
--------
Takahashi
--------
2 2 0
--------
Aoki
--------
2 2 1
--------
Takahashi
--------
```

### 問題の解答をデバッグする

問題の解答をデバッグするには、ソースコードを開いてから `AtCoder Extension: Debug Task` でデバッグ実行します。

- テストデータの個数だけデバッグ実行が繰り返されます。

![debugtask](https://github.com/taizod1024/ac-ts-extension/blob/main/images/debugtask.gif?raw=true)

### 問題の解答を提出する

解答の作成が完了したら、ソースコードを開いてから `AtCoder Extension: Submit Task` で解答を提出します。

- 言語を選択します。
- 構文エラーがあっても提出されます。テスト実行が失敗していても提出されます。注意してください。

![submittask](https://github.com/taizod1024/ac-ts-extension/blob/main/images/submittask.gif?raw=true)

### 不要なソースコードとテストデータを削除する

`AtCoder Extension: Remove Task` を実行すると、問題のソースコードとテストデータを対で削除します。

### ブラウザで問題ページを開く

`AtCoder Extension: Browse Task` を実行すると、ブラウザで問題ページを開きます。

## 設定

### ソースコードのひな形

独自のソースコードをひな形に使用する場合はフォルダ配下の `template/template.c`, `template.cpp`, `template.java`, `template.py`, `template.js`, `template.ts` に格納してください。

### C/C++/Java 設定

自身の環境に合わせて vscode の設定を変更します。

| 設定名        | 内容                                   | 補足                        |
| ------------- | -------------------------------------- | --------------------------- |
| C Checker     | `gcc --version`                        | C コンパイラ存在チェック    |
| C Compiler    | `gcc $taskfile -o $execfile -lm`       | C コンパイラ                |
| C Executor    | `$execfile`                            | C 実行ファイル              |
| C++ Checker   | `g++ --version`                        | C++コンパイラ存在チェック   |
| C++ Compiler  | `g++ $taskfile -o $execfile`           | C++コンパイラ               |
| C++ Executor  | `$execfile`                            | C++実行ファイル             |
| Java Checker  | `javac --version`                      | Java コンパイラ存在チェック |
| Java Compiler | `javac -J-Duser.language=en $taskfile` | Java コンパイラ             |
| Java Executor | `cd $tmppath && java Main`             | Java 実行ファイル           |

パラメタを使用できます。

| パラメタ名     | 記法         | 展開例                                              |
| -------------- | ------------ | --------------------------------------------------- |
| 一時フォルダ   | `$tmppath`   | `C:\Users\...\AppData\Local\Temp\ac-ts-extension`   |
| タスクファイル | `$taskfile`  | `C:\Users\...\src\atcoder\practice\practice_1.c`    |
| 実行ファイル   | `$execfile`  | `C:\Users\....\src\atcoder\practice\practice_1.exe` |
| サイト         | `$site`      | `atcoder`                                           |
| コンテスト     | `$contest`   | `practice`                                          |
| タスク         | `$task`      | `practice_1`                                        |
| 拡張子         | `$extension` | `.c`                                                |

### Python 設定

特にありません。

### Go 設定

特にありません。

### JavaScript 設定

特にありません。

### TypeScript 設定

TypeScript のテスト実行には ts-node を使用しています。

- 起動時間の短縮のためにトランスパイルのみしています(環境変数`TS_NODE_TRANSPILE_ONLY=1`)。そのため、ts-node 起動時の型チェックは行いません。
- `tsconfig.json` があればそれに従います。

TypeScript のデバッグ実行には vscode のデバッグ機能から ts-node を呼び出しています。

- `tsconfig.json` があればそれに従います。

### プロキシ設定

プロキシ環境では環境変数`HTTP_PROXY`および`HTTPS_PROXY`を設定します。

```shell
set HTTP_PROXY=http://proxy.server:8080
set HTTPS_PROXY=http://proxy.server:8080
```

認証プロキシ環境では以下の形式で設定します。

```shell
set HTTP_PROXY=http://username:password@proxy.server:8080
set HTTPS_PROXY=http://username:password@proxy.server:8080
```
