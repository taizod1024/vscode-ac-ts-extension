import * as vscode from "vscode";
import * as fs from "fs";
import child_process, { ExecFileSyncOptions } from "child_process";
import { acts } from "../AcTsExtension";
import { XExtension } from "../XExtension";

class Python implements XExtension {
    // implements

    // prop
    extension = ".py";

    // TODO helperにコマンド設定を集約
    // TODO 言語別に設定を分ける

    // method
    checkLang(): void {
        const command = `python3 --version`;
        const options = { cwd: acts.projectpath };
        try {
            child_process.execSync(command, options);
        } catch (ex) {
            throw `ERROR: check failed, command="${command}"`;
        }
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
        const command = `python -u ${acts.taskfile} < ${acts.tmpinfile} 1> ${acts.tmpoutfile} 2> ${acts.tmperrfile}`;
        const options = { cwd: acts.projectpath };
        const child = child_process.exec(command, options);
        return child;
    }

    submitTask(): void {}
}
export const python = new Python();
