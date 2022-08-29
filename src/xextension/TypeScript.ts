import * as vscode from "vscode";
import { acts } from "../AcTsExtension";
import { XExtension } from "../XExtension";
import { xexthelper } from "../XExtensionHelper";

class TypeScript implements XExtension {
    // implemente

    // prop
    public readonly extension = ".ts";
    public readonly language = "typescript";

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
            runtimeArgs: ["--require", "ts-node/register"],
            program: acts.taskfile,
            args: ["<", acts.tmpstdinfile, ">", acts.tmpstdoutfile, "2>", acts.tmpstderrfile],
            console: "integratedTerminal",
            skipFiles: ["node_modules/**"],
            argsCanBeInterpretedByShell: true,
            env: { TS_NODE_TRANSPILE_ONLY: "1" },
        };
        vscode.debug.startDebugging(acts.projectfolder, debugconfig);
    }

    public testTask(): any {
        return xexthelper.testTask(this.language, { env: { TS_NODE_TRANSPILE_ONLY: "1" } });
    }

    public submitTask(): void {}
}
export const typescript = new TypeScript();
