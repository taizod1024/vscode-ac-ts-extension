# AtCoder/Yukicoder Extension

Python/TypeScriptでの[AtCoder](https://atcoder.jp/?lang=ja)/[Yukicoder](https://yukicoder.me/)への参加をサポートするVisual Studio Codeの拡張機能です。

## 機能

Python/TypeScriptでのVisual Studio CodeからAtCoder/Yukicoderへの参加をサポートします。

- AtCoderへのログイン
- ソースコードの生成、テストデータのダウンロード
- 解答のテスト実行、デバッグ実行
- 解答の提出
- ブラウザでの問題ページの表示

![testtask](https://github.com/taizod1024/ac-ts-extension/blob/main/images/testtask.gif?raw=true)

## 制限

マルチルートワークスペースには対応していません。

## 環境

- Windows 10 (20H2で動作確認)
- Visual Studio Code (1.60.2で動作確認)
- Python (3.9.7で動作確認)
- TypeScript (Node.js 16.1で動作確認)

## 準備

[AtCoder](https://atcoder.jp/?lang=ja) および [Yukicoder](https://yukicoder.me/) でユーザ登録します。Yukicoderの場合はプロフィール画面のAPIキーを確認しておいてください。

### Python

[Python](https://www.python.org/) をインストールします。

### TypeScript

1. [Node.js](https://nodejs.org/ja/) をインストールします。
2. vscodeを実行します。
   1. [拡張機能] から `AtCoder Extension` を検索してインストールします。
   2. [ファイル] > [フォルダを開く] からフォルダを選択します。
   3. [ターミナル] > [新しいターミナル] から以下のコマンドを実行します。入力を求められたらすべてEnterキーを押して進めてください。
     ```shell
     npm init
     npm install --save-dev typescript ts-node @types/node
     ```

![npminit](https://github.com/taizod1024/ac-ts-extension/blob/main/images/npminit.gif?raw=true)

## 使い方

vscodeで `F1` を押下（もしくは [表示] > [コマンド パレット] を選択、`Ctrl+Shift+P` を押下）して [コマンド パレット] から機能を選択します。

### AtCoder/Yukicoderへログインする

はじめに `AtCoder Extension: Login Site` でユーザ名とパスワードを入力してAtCoderにログインします。
Yukicoderの場合はプロフィール画面のAPIキーを入力します。

![loginsite](https://github.com/taizod1024/ac-ts-extension/blob/main/images/loginsite.gif?raw=true)


### 問題をはじめる

まずはじめに `AtCoder Extension: Init Task` で問題名を入力して提出用のソースコードの生成と問題用のテストデータのダウンロードをします。

- 最初にサイトを`atcoder`,`yukicoder`から選択します。
- コンテスト名はAtCoderの場合は `abc190`の形式、Yukicoderの場合は`351`の形式で入力します。いずれもURLから確認してください。
- 問題名はAtCoderの場合は `abc190_a` の形式、Yukicoderの場合は`1692`の形式で入力します。いずれもURLから確認してください。
- 解答する言語は`.py`,`.ts`から選択します。
- ソースコードは `src/atcoder/abcXXX/abcXXX_X.py`, `abcXXX_X.ts` に生成されます。
- テストデータは `src/atcoder/abcXXX/abcXXX_X.txt` にダウンロードされます。
- フォルダは自動的に作成されます。
- 既にソースコードやテストデータがある場合はスキップされます。

![inittask](https://github.com/taizod1024/ac-ts-extension/blob/main/images/inittask.gif?raw=true)

### 問題に解答する

生成されたソースコードのmain()を修正します。
ソースコードのひな型にカスタマイズしたい場合は、後述の[設定](#設定)を参照してください。

#### Pythonひな型

```Python
# TODO edit the code

# param
n = int(input())

# solve
ans = n

# answer
print(ans)
```

#### TypeScriptひな型

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

    // TODO edit the code

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

- 処理が5秒以上続くと自動的に中断します。
- 誤差が許容される問題の多くはNGになります。目視で判断してください。
- bigintでの出力が必要な問題は文字列化して末尾の `n` を除去して出力してください。

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

- 構文エラーがあっても提出されます。テスト実行が失敗していても提出されます。注意してください。

![submittask](https://github.com/taizod1024/ac-ts-extension/blob/main/images/submittask.gif?raw=true)

### 不要なソースコードとテストデータを削除する

`AtCoder Extension: Remove Task` を実行すると、問題のソースコードとテストデータを対で削除します。

### ブラウザで問題ページを開く

`AtCoder Extension: Browse Task` を実行すると、ブラウザで問題ページを開きます。

## 設定

### ソースコードのひな形

独自のソースコードをひな形に使用する場合はフォルダ配下の `template/default.py`, `default.ts` に格納してください。

### Python設定

特にありません。

### TypeScript設定

TypeScriptのテスト実行にはts-nodeを使用しています。

- 起動時間の短縮のためにトランスパイルのみしています(環境変数`TS_NODE_TRANSPILE_ONLY=1`)。そのため、ts-node起動時の型チェックは行いません。
- `tsconfig.json` があればそれに従います。

TypeScriptのデバッグ実行にはvscodeのデバッグ機能からts-nodeを呼び出しています。

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
