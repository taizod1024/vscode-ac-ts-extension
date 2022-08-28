import * as vscode from "vscode";
import * as fs from "fs";
import child_process, { ExecFileSyncOptions } from "child_process";
import { acts } from "../AcTsExtension";
import { XExtension } from "../XExtension";
import { xexthelper } from "../XExtensionHelper";

class JavaScript implements XExtension {
    // implemente

    // prop
    public readonly extension = ".js";
    public readonly language = "javascript";

    // method
    public checkLang(): void {
        xexthelper.checkLang(this.language);
    }

    public initTask(): void {}

    public compileTask(): void {
        xexthelper.compileTask(this.language);
    }

    public debugTask(): any {
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

    public testTask(): any {
        return xexthelper.testTask(this.language);
    }

    public submitTask(): void {}
}
export const javascript = new JavaScript();
