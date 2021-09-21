import * as rl from "readline";

// util for input
const lineit = rl.createInterface({ input: process.stdin });
const wordit = (async function* () { for await (const line of lineit) for (const word of line.split(" ")) yield await word; })();
const charit = (async function* () { for await (const line of lineit) for (const word of line.split(" ")) for (const char of word.split("")) yield await char; })();
const read = async () => String((await wordit.next()).value);
const readchar = async () => String((await charit.next()).value);

// main
const main = async function () {

    // TODO edit the code

    // 入力処理

    // ＜例＞文字列
    //       S
    //
    // // param
    // let s: string;
    //
    // // init
    // s = await read();
    
    // ＜例＞数値
    //       N
    //
    // // param
    // let n: number;
    //
    // // init
    // n = Number(await read());

    // ＜例＞bitint
    //       N
    //
    // // param
    // let n: bigint;
    //
    // // init
    // n = BigInt(await read());

    // ＜例＞数値ペア
    //       N K
    //
    // // param
    // let n: number, k: number;
    //
    // // init
    // n = Number(await read());
    // k = Number(await read());

    // ＜例＞数値タプル
    //       N K L
    //
    // // param
    // let n: number, k: number, l: number;
    //
    // // init
    // n = Number(await read());
    // k = Number(await read());
    // l = Number(await read());

    // ＜例＞一次元数値配列（横）
    //       N
    //       A1 A2 ... An
    //
    // // param
    // let n: number;
    // let an: number[] = [];
    //
    // // init
    // n = Number(await read());
    // for (let nx = 0; nx < n; nx++) {
    //     an.push(Number(await read()))
    // }

    // ＜例＞一次元数値配列（縦）
    //       N
    //       A1
    //       A2
    //       :
    //       An
    //
    // // param
    // let n: number;
    // let an: number[] = [];
    //
    // // init
    // n = Number(await read());
    // for (let nx = 0; nx < n; nx++) {
    //     an.push(Number(await read()))
    // }

    // ＜例＞一次元文字列配列（縦）
    //       N
    //       S1
    //       S2
    //       :
    //       Sn
    //
    // // param
    // let n: number;
    // let an: number[] = [];
    //
    // // init
    // n = Number(await read());
    // for (let nx = 0; nx < n; nx++) {
    //     an.push(await read())
    // }

    // ＜例＞一次元数値配列ペア（縦）
    //       N
    //       X1 Y1
    //       X2 Y2
    //       :  :
    //
    // // param
    // let n: number;
    // let xn: number[] = [], yn: number[] = [];
    //
    // // init
    // n = Number(await read());
    // for (let nx = 0; nx < n; nx++) {
    //     xn.push(Number(await read()));
    //     yn.push(Number(await read()));
    // }

    // ＜例＞一次元オブジェクト配列（縦）
    //       N
    //       S1 T1
    //       S2 T2
    //       :  :
    //       Sn Tn
    //
    // // param
    // let n: number;
    // let stn: { s: string, t: number }[] = [];
    //
    // // init
    // n = Number(await read());
    // for (let nx = 0; nx < n; nx++) {
    //     stn.push({ s: await read(), t: Number(await read()) });
    // }

    // ＜例＞二次元数値配列
    //       N M
    //       A11 A12 ... A1m
    //       A21 A22 ... A2m 
    //       :   :       :
    //       An1 An2 ... Anm 
    //
    // // param
    // let n: number, m: number;
    // let anm: number[][] = [];
    //
    // // init
    // n = Number(await read());
    // m = Number(await read());
    // for (let nx = 0; nx < n; nx++) {
    //     anm.push([]);
    //     for (let mx = 0; mx < m; mx++) {
    //         anm.slice(-1)[0].push(Number(await read()));
    //     }
    // }

    // ＜例＞文字グリッド
    //       H W
    //       S11 S12 ... S1w
    //       S21 S22 ... S2w 
    //       :   :       :
    //       Sh1 Sh2 ... Shw 
    //
    // // param
    // let h: number, w: number;
    // let shw: string[][] = [];
    //
    // // init
    // h = Number(await read());
    // w = Number(await read());
    // for (let hx = 0; hx < h; hx++) {
    //     shw.push((await read()).split(""));
    // }

    // ＜例＞文字座標
    //       H W
    //       S11 S12 ... S1w
    //       S21 S22 ... S2w 
    //       :   :       :
    //       Sh1 Sh2 ... Shw 
    //
    // // param
    // let h: number, w: number;
    // let sm: number[][];
    //
    // // init
    // h = Number(await read());
    // w = Number(await read());
    // sm = [];
    // for (let hx = 0; hx < h; hx++) {
    //     for (let wx = 0; wx < w; wx++) {
    //         if ((await readchar()) == "#") {
    //             sm.push([hx, wx]);
    //         }
    //     }
    // }

    // solve
    let ans;

    // 出力処理

    // ＜例＞bigintの末尾の"n"を削除して出力
    // ans = ans.toString().replace("n", "");

    // ＜例＞文字列配列を改行で結合して出力
    // ans = ans.join("\n");

    // ＜例＞二次元数値配列を結合して出力
    // ans = anm.map(an => an.join(" ")).join("\n");

    // answer
    console.log(ans);

    return;

};
main();
