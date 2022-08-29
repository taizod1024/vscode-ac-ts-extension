import * as vscode from "vscode";
import { acts } from "../AcTsExtension";
import { XExtension } from "../XExtension";
import { xexthelper } from "../XExtensionHelper";

class Python implements XExtension {
    // implements

    // prop
    public readonly extension = ".py";
    public readonly language = "python";

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
            type: "python",
            request: "launch",
            program: acts.taskfile,
            args: ["<", acts.tmpstdinfile, ">", acts.tmpstdoutfile, "2>", acts.tmpstderrfile],
            console: "integratedTerminal",
        };
        vscode.debug.startDebugging(acts.projectfolder, debugconfig);
    }

    public testTask(): any {
        return xexthelper.testTask(this.language);
    }

    public submitTask(): void {}
}
export const python = new Python();
