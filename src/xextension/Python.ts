import * as vscode from "vscode";
import * as fs from "fs";
import child_process, { ExecFileSyncOptions } from "child_process";
import { acts } from "../AcTsExtension";
import { IExtension } from "../IExtension";

class Python implements IExtension {
    // implements

    // prop
    extension = ".py";

    // method
    isSelected(): boolean {
        return acts.extension === ".py";
    }

    checkLang(): void {
        const command = `python --version`;
        const options = { cwd: acts.projectpath };
        try {
            child_process.execSync(command, options);
        } catch (ex) {
            throw `ERROR: check failed, command="${command}"`;
        }
    }

    compileTask(): void {}

    debugTask(): any {
        const launchconfig = {
            name: acts.appid,
            type: "python",
            request: "launch",
            program: acts.taskfile,
            args: ["<", acts.tmptestinfile, "1>", acts.tmptestoutfile, "2>", acts.tmptesterrfile],
            console: "integratedTerminal",
        };
        vscode.debug.startDebugging(acts.projectfolder, launchconfig);
    }

    testTask(): any {
        const command = `python -u ${acts.taskfile} < ${acts.tmptestinfile} 1> ${acts.tmptestoutfile} 2> ${acts.tmptesterrfile}`;
        const options = { cwd: acts.projectpath };
        const child = child_process.exec(command, options);
        return child;
    }
}
export const python = new Python();
