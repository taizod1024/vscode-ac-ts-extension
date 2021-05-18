export { };
// main
function main(input: string[]): number {
    // param
    let ans: number;

    // 入力処理サンプル

    // ＜例＞文字列
    //       S
    // let s: string;
    // s = input.shift();

    // ＜例＞数値
    //       N
    // let n: number;
    // n = Number(input.shift());

    // ＜例＞数値ペア
    //       N K
    // let n: number, k: number;
    // [n, k] = input.shift().split(" ").map(x => Number(x));

    // ＜例＞一次元数値配列（横）
    //       N
    //       A1 A2 ... An
    // let n: number;
    // let an: number[];
    // n = Number(input.shift());
    // an = input.shift().split(" ").map(x => Number(x));
 
    // ＜例＞一次元数値配列（縦）
    //       N
    //       A1
    //       A2
    //       :
    //       An
    // let n: number;
    // let an: number[];
    // n = Number(input.shift());
    // an = input.shift().split(" ").map(x => Number(x));

    // ＜例＞二次元数値配列
    //       N M
    //       A11 A12 ... A1m
    //       A21 A22 ... A2m 
    //       :   :       :
    //       An1 An2 ... Anm 
    // let n: number, m:number;
    // let anm: number[][];
    // [n, m] = input.shift().split(" ").map(x => Number(x));
    // anm = input.map(x => x.split(" ").map(x => Number(x)));

    // ＜例＞一次元数値配列ペア
    //       N
    //       X1 Y1
    //       X2 Y2
    //       :  :
    // let n: number;
    // let xn: number[], yn: number[];
    // n = Number(input.shift());
    // [xn, yn] = [new Array(n), new Array(n)];
    // for (let nx = 0; nx < n; nx++) {
    //     [xn[nx], yn[nx]] = input.shift().split(" ").map(x => Number(x));
    // }

    // ＜例＞一次元文字列配列
    //       N
    //       S1
    //       S2
    //       :
    //       Sn
    // let n: number;
    // let sn: string[];
    // n = Number(input.shift());
    // sn = input;

    // ＜例＞一次元オブジェクト配列
    //       N
    //       S1 T1
    //       S2 T2
    //       :  :
    //       Sn Tn
    // let n: number;
    // let stn: { s: string, t: number }[];
    // n = Number(input.shift());
    // stn = input.map(x => { let st = x.split(" "); return { s: st[0], t: Number(st[1]) } });

    // ＜例＞bitint
    //       N
    // let n: bigint;
    // n = BigInt(input.shift());

    // solve

    // 出力処理サンプル

    // ＜例＞bigintの末尾の"n"を削除する。
    // ans = ans.toString().replace("n", "");

    // ＜例＞文字列配列を改行で結合して出力する。
    // ans = ans.join("\n");

    // answer
    return ans;
}
// entrypoint
function entrypoint() {
    const lines: string[] = [];
    const reader = require('readline').createInterface({ input: process.stdin, output: process.stdout });
    reader.on('line', function (line: string) { lines.push(line); });
    reader.on('close', function () { let input = lines; console.log(main(input)); });
}
entrypoint();
