import * as vscode from "vscode";
import * as fs from "fs";
import child_process, { ExecFileSyncOptions } from "child_process";
import { acts } from "../AcTsExtension";
import { XExtension } from "../XExtension";
import { xexthelper } from "../XExtensionHelper";

class TypeScript implements XExtension {
    // implemente

    // prop
    extension = ".ts";

    // method
    checkLang(): void {
        xexthelper.checkLang("typescript", "checker");
    }

    initTask(): void {}
    compileTask(): void {}

    debugTask(): any {
        const debugconfig = {
            name: acts.appid,
            type: "pwa-node",
            request: "launch",
            runtimeArgs: ["--require", "ts-node/register"],
            program: acts.taskfile,
            args: ["<", acts.tmpinfile, "1>", acts.tmpoutfile, "2>", acts.tmperrfile],
            console: "integratedTerminal",
            skipFiles: ["node_modules/**"],
            env: { TS_NODE_TRANSPILE_ONLY: "1" },
        };
        vscode.debug.startDebugging(acts.projectfolder, debugconfig);
    }

    testTask(): any {
        return xexthelper.testTask("typescript", "executor");
    }

    submitTask(): void {}
}
export const typescript = new TypeScript();
