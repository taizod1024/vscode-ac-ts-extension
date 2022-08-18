import * as vscode from "vscode";
import * as fs from "fs";
import child_process, { ExecFileSyncOptions } from "child_process";
import { acts } from "../AcTsExtension";
import { IExtension } from "../IExtension";

class TypeScript implements IExtension {
    // implemente

    // prop
    extension = ".ts";

    // method
    isSelected(): boolean {
        return acts.extension === this.extension;
    }

    checkLang(): void {
        if (!fs.existsSync(acts.packagejsonfile) || !fs.existsSync(acts.packagelockjsonfile)) {
            throw `ERROR: missing package.json or package-lock.json, install node.js, run "npm init && npm install --save-dev typescript ts-node @types/node"`;
        }
    }

    compileTask(): void {}

    debugTask(): any {
        const launchconfig = {
            name: acts.appid,
            type: "pwa-node",
            request: "launch",
            runtimeArgs: ["--require", "ts-node/register"],
            program: acts.taskfile,
            args: ["<", acts.tmptestinfile, "1>", acts.tmptestoutfile, "2>", acts.tmptesterrfile],
            console: "integratedTerminal",
            skipFiles: ["node_modules/**"],
            env: { TS_NODE_TRANSPILE_ONLY: "1" },
        };
        vscode.debug.startDebugging(acts.projectfolder, launchconfig);
    }

    testTask(): any {
        const command = `node --require ts-node/register ${acts.taskfile} < ${acts.tmptestinfile} 1> ${acts.tmptestoutfile} 2> ${acts.tmptesterrfile}`;
        const options = { cwd: acts.projectpath, env: { TS_NODE_TRANSPILE_ONLY: "1" } };
        const child = child_process.exec(command, options);
        return child;
    }
}
export const typescript = new TypeScript();
