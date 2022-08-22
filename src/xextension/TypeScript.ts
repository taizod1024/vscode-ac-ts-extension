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
            args: ["<", acts.tmpstdinfile, "1>", acts.tmpstdoutfile, "2>", acts.tmpstderrfile],
            console: "integratedTerminal",
            skipFiles: ["node_modules/**"],
            env: { TS_NODE_TRANSPILE_ONLY: "1" },
        };
        vscode.debug.startDebugging(acts.projectfolder, debugconfig);
    }

    testTask(): any {
        // TODO 何故かexitがnullになる実行されていない模様、環境変数が足りないため
        // return xexthelper.testTask("typescript", "executor");
        const command = `node --require ts-node/register ${acts.taskfile} < ${acts.tmpstdinfile} 1> ${acts.tmpstdoutfile} 2> ${acts.tmpstderrfile}`;
        const options = { cwd: acts.projectpath, env: { TS_NODE_TRANSPILE_ONLY: "1" } };
        const child = child_process.exec(command, options);
        return child;
    }

    submitTask(): void {}
}
export const typescript = new TypeScript();
