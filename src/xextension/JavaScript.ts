import * as vscode from "vscode";
import * as fs from "fs";
import child_process, { ExecFileSyncOptions } from "child_process";
import { acts } from "../AcTsExtension";
import { XExtension } from "../XExtension";
import { xexthelper } from "../XExtensionHelper";

class JavaScript implements XExtension {
    // implemente

    // prop
    extension = ".js";
    language = "javascript";

    // method
    checkLang(): void {
        xexthelper.checkLang(this.language);
    }

    initTask(): void {}

    compileTask(): void {
        xexthelper.compileTask(this.language);
    }

    debugTask(): any {
        if (acts.islinux) {
            throw "ERROR: debug is not supported in linux";
        }
        const debugconfig = {
            name: acts.appid,
            type: "pwa-node",
            request: "launch",
            program: acts.taskfile,
            args: ["<", acts.tmpstdinfile, ">", acts.tmpstdoutfile, "2>", acts.tmpstderrfile],
            console: "integratedTerminal",
            skipFiles: ["node_modules/**"],
        };
        vscode.debug.startDebugging(acts.projectfolder, debugconfig);
    }

    testTask(): any {
        return xexthelper.testTask(this.language);
    }

    submitTask(): void {}
}
export const javascript = new JavaScript();
