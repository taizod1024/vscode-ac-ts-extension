import * as vscode from "vscode";
import * as fs from "fs";
import child_process, { ExecFileSyncOptions } from "child_process";
import { acts } from "../AcTsExtension";
import { XExtension } from "../XExtension";
import { xexthelper } from "../XExtensionHelper";

class Python implements XExtension {
    // implements

    // prop
    extension = ".py";

    // TODO helperにコマンド設定を集約
    // TODO 言語別に設定を分ける

    // method
    checkLang(): void {
        xexthelper.checkLang("python", "checker");
    }

    initTask(): void {}

    compileTask(): void {}

    debugTask(): any {
        const debugconfig = {
            name: acts.appid,
            type: "python",
            request: "launch",
            program: acts.taskfile,
            args: ["<", acts.tmpinfile, "1>", acts.tmpoutfile, "2>", acts.tmperrfile],
            console: "integratedTerminal",
        };
        vscode.debug.startDebugging(acts.projectfolder, debugconfig);
    }

    testTask(): any {
        return xexthelper.testTask("python", "executor");
    }

    submitTask(): void {}
}
export const python = new Python();
