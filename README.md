# AtCoder TypeScript Extension

![Status-WIP](https://img.shields.io/badge/Status-WIP-orange)

TypeScriptでの[AtCoder](https://atcoder.jp/?lang=ja)への参加をサポートするVisual Studio Codeの拡張機能です。

## 機能

- TypeScriptでのVisual Studio CodeからAtCoderへの参加をサポートします。
  - AtCoderへのログイン
  - ソースコードの生成、テストデータのダウンロード
  - 解答のテスト実行、デバッグ実行
  - 解答の提出
- 最小限のNode.jsおよびTypeScriptの設定で始められます。
  - `package.json` 編集不要
  - `tsconfig.json` 不要

![testtask](https://github.com/taizod1024/ac-ts-extension/blob/main/images/testtask.gif?raw=true)

## 環境

- Windows 10 (20H2で動作確認)
- Visual Studio Code (1.56.2で動作確認)
- Node.js (16.1で動作確認)

## 準備

1. [AtCoder](https://atcoder.jp/?lang=ja) でユーザ登録します。
2. [Node.js](https://nodejs.org/ja/) をインストールします。
3. vscodeを実行します。
   1. [拡張機能] から `AtCoder TypeScript Extension` を検索してインストールします。
   2. [ファイル] > [フォルダを開く] からフォルダを選択します。
   3. [ターミナル] > [新しいターミナル] から以下のコマンドを実行します。入力を求められたらすべてEnterキーを押して進めてください。
     ```shell
     npm init
     npm install --save-dev typescript ts-node @types/node
     ```

![npminit](https://github.com/taizod1024/ac-ts-extension/blob/main/images/npminit.gif?raw=true)

## 使い方

vscodeで `F1` を押下（もしくは [表示] > [コマンド パレット] を選択、`Ctrl+Shift+P` を押下）して [コマンド パレット] から機能を選択します。

- マルチルートワークスペースには対応していません。

### AtCoderへログインする

はじめに `AtCoder TypeScript Extension: Login Site` でユーザ名とパスワードを入力してAtCoderにログインします。

![loginsite](https://github.com/taizod1024/ac-ts-extension/blob/main/images/loginsite.gif?raw=true)

### 問題をはじめる

まずはじめに `AtCoder TypeScript Extension: Init Task` で問題名を入力して提出用のソースコードの生成と問題用のテストデータのダウンロードをします。
- 問題名は `abc190_a` の形式で入力します。
- ソースコードは `src/atcoder/abcXXX/abcXXX_X.ts` に生成されます。
- テストデータは `src/atcoder/abcXXX/abcXXX_X.txt` にダウンロードされます。
- フォルダは自動的に作成されます。
- 既にソースコードやテストデータがある場合はスキップされます。

![inittask](https://github.com/taizod1024/ac-ts-extension/blob/main/images/inittask.gif?raw=true)

### 問題に解答する

生成されたソースコードのmain()を修正します。
- ソースコードのひな型にカスタマイズしたい場合は、後述の[設定](#設定)を参照してください。

```TypeScript
export { };
// main
function main(input: string[]) {
    // param
    let ans: any;

    // // 入力処理サンプル

    // // <例> S
    // // let s;
    // // s = input.shift();

    // // <例> N
    // // let n;
    // // n = Number(input.shift());

    // // <例> N K
    // // let n, k;
    // // [n, k] = input.shift().split(" ").map(x => Number(x));

    // ... 以下略 ...

    // solve

    // // 出力処理サンプル

    // // bigintの末尾の"n"を削除する場合
    // // ans = ans.toString().replace("n", "");

    // // 配列を結合して出力する場合
    // // ans = ans.join("\n");

    // answer
    console.log(ans);
    return;
}
// entrypoint
function entrypoint() {
    const lines: string[] = [];
    const reader = require('readline').createInterface({ input: process.stdin, output: process.stdout });
    reader.on('line', function (line: string) { lines.push(line); });
    reader.on('close', function () { let input = lines; main(input); });
}
entrypoint();
```

### 問題の解答をテストする

問題の解答を作成したら、ソースコードを開いてから `AtCoder TypeScript Extension: Test Task` でテスト実行します。
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

問題の解答をデバッグするには、ソースコードを開いてから `AtCoder TypeScript Extension: Debug Task` でデバッグ実行します。
- テストデータの個数だけデバッグ実行が繰り返されます。

![debugtask](https://github.com/taizod1024/ac-ts-extension/blob/main/images/debugtask.gif?raw=true)

### 問題の解答を提出する

解答の作成が完了したら、ソースコードを開いてから `AtCoder TypeScript Extension: Submit Task` で解答を提出します。
- 構文エラーがあっても提出されます。テスト実行が失敗していても提出されます。注意してください。

![submittask](https://github.com/taizod1024/ac-ts-extension/blob/main/images/submittask.gif?raw=true)

### 不要なソースコードとテストデータを削除する

`AtCoder TypeScript Extension: Remove Task` を実行すると、問題のソースコードとテストデータを対で削除します。

## 設定

### ソースコードのひな形

独自のソースコードをひな形に使用する場合はフォルダ配下の `template/default.ts` に格納してください。

### TypeScript設定

- TypeScriptのテスト実行にはts-nodeを使用しています。
  - 起動時間の短縮のためにトランスパイルのみしています(環境変数`TS_NODE_TRANSPILE_ONLY=1`)。そのため、ts-node起動時の型チェックは行いません。
  - `tsconfig.json` があればそれに従います。
- TypeScriptのデバッグ実行にはvscodeのデバッグ機能からts-nodeを呼び出しています。
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
