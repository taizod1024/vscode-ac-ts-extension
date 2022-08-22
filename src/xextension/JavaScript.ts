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

    // method
    checkLang(): void {
        xexthelper.checkLang("javascript");
    }

    initTask(): void {}
    compileTask(): void {}

    debugTask(): any {
        const debugconfig = {
            name: acts.appid,
            type: "pwa-node",
            request: "launch",
            program: acts.taskfile,
            args: ["<", acts.tmpstdinfile, "1>", acts.tmpstdoutfile, "2>", acts.tmpstderrfile],
            console: "integratedTerminal",
            skipFiles: ["node_modules/**"],
        };
        vscode.debug.startDebugging(acts.projectfolder, debugconfig);
    }

    testTask(): any {
        return xexthelper.testTask("javascript");
    }

    submitTask(): void {}
}
export const javascript = new JavaScript();
