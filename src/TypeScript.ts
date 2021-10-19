import * as vscode from 'vscode';
import * as fs from "fs";
import child_process, { ExecFileSyncOptions } from "child_process";
import { actsextension, Lang } from './AcTsExtension';

class TypeScript implements Lang {

    // implemente

    // prop
    name = "typescript";
    extension = ".ts";
    
    // method
    checkLang(): void {
        if (!fs.existsSync(actsextension.packagejsonfile) || !fs.existsSync(actsextension.packagelockjsonfile)) {
            throw `ERROR: missing package.json or package-lock.json, install node.js, run "npm init && npm install --save-dev typescript ts-node @types/node"`;
        }
    }

    isSelected():boolean {
        return actsextension.extension === ".ts";
    }

    testLang(debug: boolean): any {
        let child = null;
        if (debug) {
            const launchconfig = {
                name: actsextension.appid,
                type: "pwa-node",
                request: "launch",
                runtimeArgs: ["--require", "ts-node/register"],
                program: actsextension.taskfile,
                args: ["<", actsextension.tmptestinfile, ">", actsextension.tmptestoutfile, "2>", actsextension.tmptesterrfile],
                console: "integratedTerminal",
                skipFiles: ["node_modules/**"],
                env: { TS_NODE_TRANSPILE_ONLY: "1" }
            };
            vscode.debug.startDebugging(actsextension.projectfolder, launchconfig);
        } else {
            const command = `node --require ts-node/register ${actsextension.taskfile} < ${actsextension.tmptestinfile} > ${actsextension.tmptestoutfile} 2> ${actsextension.tmptesterrfile}`;
            const options = {
                cwd: actsextension.projectpath,
                env: { TS_NODE_TRANSPILE_ONLY: "1" }
            };
            child = child_process.exec(command, options);
        }
        return child;
    }
}
export const typescript = new TypeScript();
