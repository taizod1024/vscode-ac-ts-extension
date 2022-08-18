import * as vscode from "vscode";
import * as fs from "fs";
import child_process, { ExecFileSyncOptions } from "child_process";
import { acts } from "../AcTsExtension";
import { IExtension } from "../XExtension";

class JavaScript implements IExtension {
    // implemente

    // prop
    name = "javascript";
    extension = ".js";

    // method
    isSelected(): boolean {
        return acts.extension === ".js";
    }

    checkLang(): void {
        if (!fs.existsSync(acts.packagejsonfile) || !fs.existsSync(acts.packagelockjsonfile)) {
            throw `ERROR: missing package.json or package-lock.json, install node.js, run "npm init"`;
        }
    }

    compileTask(): void {}

    debugTask(): any {
        const launchconfig = {
            name: acts.appid,
            type: "pwa-node",
            request: "launch",
            program: acts.taskfile,
            args: ["<", acts.tmptestinfile, "1>", acts.tmptestoutfile, "2>", acts.tmptesterrfile],
            console: "integratedTerminal",
            skipFiles: ["node_modules/**"],
        };
        vscode.debug.startDebugging(acts.projectfolder, launchconfig);
    }

    testTask(): any {
        const command = `node ${acts.taskfile} < ${acts.tmptestinfile} 1> ${acts.tmptestoutfile} 2> ${acts.tmptesterrfile}`;
        const options = { cwd: acts.projectpath };
        const child = child_process.exec(command, options);
        return child;
    }
}
export const javascript = new JavaScript();
