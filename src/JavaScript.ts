import * as vscode from 'vscode';
import * as fs from "fs";
import child_process, { ExecFileSyncOptions } from "child_process";
import { actsextension, Lang } from './AcTsExtension';

class JavaScript implements Lang {

    // implemente

    // prop
    name = "javascript";
    extension = ".js";

    // method
    checkLang(): void {
        if (!fs.existsSync(actsextension.packagejsonfile) || !fs.existsSync(actsextension.packagelockjsonfile)) {
            throw `ERROR: missing package.json or package-lock.json, install node.js, run "npm init"`;
        }
    }

    isSelected(): boolean {
        return actsextension.extension === ".js";
    }

    testLang(debug: boolean): any {
        let child = null;
        if (debug) {
            const launchconfig = {
                name: actsextension.appid,
                type: "pwa-node",
                request: "launch",
                program: actsextension.taskfile,
                args: ["<", actsextension.tmptestinfile, ">", actsextension.tmptestoutfile, "2>", actsextension.tmptesterrfile],
                console: "integratedTerminal",
                skipFiles: ["node_modules/**"]
            };
            vscode.debug.startDebugging(actsextension.projectfolder, launchconfig);
        } else {
            const command = `node ${actsextension.taskfile} < ${actsextension.tmptestinfile} > ${actsextension.tmptestoutfile} 2> ${actsextension.tmptesterrfile}`;
            const options = {
                cwd: actsextension.projectpath,
            };
            child = child_process.exec(command, options);
        }
        return child;
    }
}
export const javascript = new JavaScript();
