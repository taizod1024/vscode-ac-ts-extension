import * as vscode from "vscode";
import * as fs from "fs";
import child_process, { ExecFileSyncOptions } from "child_process";
import { acts } from "../AcTsExtension";
import { XExtension } from "../XExtension";

class JavaScript implements XExtension {
    // implemente

    // prop
    extension = ".js";

    // method
    checkLang(): void {
        if (!fs.existsSync(acts.packagejsonfile) || !fs.existsSync(acts.packagelockjsonfile)) {
            throw `ERROR: missing package.json or package-lock.json, install node.js, run "npm init"`;
        }
    }

    initTask(): void {}
    compileTask(): void {}

    debugTask(): any {
        const debugconfig = {
            name: acts.appid,
            type: "pwa-node",
            request: "launch",
            program: acts.taskfile,
            args: ["<", acts.tmpinfile, "1>", acts.tmpoutfile, "2>", acts.tmperrfile],
            console: "integratedTerminal",
            skipFiles: ["node_modules/**"],
        };
        vscode.debug.startDebugging(acts.projectfolder, debugconfig);
    }

    testTask(): any {
        const command = `node ${acts.taskfile} < ${acts.tmpinfile} 1> ${acts.tmpoutfile} 2> ${acts.tmperrfile}`;
        const options = { cwd: acts.projectpath };
        const child = child_process.exec(command, options);
        return child;
    }

    submitTask(): void {}
}
export const javascript = new JavaScript();
