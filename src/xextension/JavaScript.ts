import * as vscode from "vscode";
import * as fs from "fs";
import child_process, { ExecFileSyncOptions } from "child_process";
import { acts } from "../AcTsExtension";
import { XExtension } from "../XExtension";

class JavaScript implements XExtension {
    // implemente

    // prop
    name = "javascript";
    extension = ".js";

    // method
    checkLang(): void {
        if (!fs.existsSync(acts.packagejsonfile) || !fs.existsSync(acts.packagelockjsonfile)) {
            throw `ERROR: missing package.json or package-lock.json, install node.js, run "npm init"`;
        }
    }

    isSelected(): boolean {
        return acts.extension === ".js";
    }

    testLang(debug: boolean): any {
        let child = null;
        if (debug) {
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
        } else {
            const command = `node ${acts.taskfile} < ${acts.tmptestinfile} 1> ${acts.tmptestoutfile} 2> ${acts.tmptesterrfile}`;
            const options = {
                cwd: acts.projectpath,
            };
            child = child_process.exec(command, options);
        }
        return child;
    }
}
export const javascript = new JavaScript();
