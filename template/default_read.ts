export { };
// main
async function main() {
    // input
    const rl = require('readline').createInterface({ input: process.stdin });
    const readlineiter = rl[Symbol.asyncIterator]();
    const readworditer = (async function* () { let vals = (await readlineiter.next()).value.split(" "); for (let nx = 0; nx < vals.length; nx++) yield vals[nx]; })();
    const readline = async () => { return (await readlineiter.next()).value; };
    const readword = async () => { return (await readworditer.next()).value; };
    // param
    let n: number;
    let anm: number[][];
    // init
    n = Number((await readline()));
    anm = [];
    for (let nx = 0; nx < n; nx++) {
        anm.push((await readline()).split(" ").map(x => Number(x)));
    }
    // TODO 新テンプレート
    // solve
    let ans = 0;
    // answer
    console.log(ans);
    return;
}
main();
