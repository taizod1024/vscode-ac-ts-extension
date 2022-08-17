import * as vscode from "vscode";
import * as fs from "fs";
import child_process, { ExecFileSyncOptions } from "child_process";
import { acts } from "../AcTsExtension";
import { XExtension } from "../XExtension";

class LangC implements XExtension {
    // implements

    // prop
    name = "C";
    extension = ".c";

    // method
    checkLang(): void {
        // throw if non-zero returned
        let config = vscode.workspace.getConfiguration(acts.appid);
        const command = String(config.get("cChecker"));
        const options = { cwd: acts.projectpath };
        try {
            child_process.execSync(command, options);
        } catch (ex) {
            throw `ERROR: cannot run "${command}"`;
        }
    }

    isSelected(): boolean {
        return acts.extension === this.extension;
    }

    testLang(debug: boolean): any {
        let child = null;
        if (debug) {
            throw "ERROR: debug is not supported";
        } else {
            // config
            let config = vscode.workspace.getConfiguration(acts.appid);
            let cmd = acts.expandString(config.get("cExecutor"));
            const command = `(${cmd}) < ${acts.tmptestinfile} 1> ${acts.tmptestoutfile} 2> ${acts.tmptesterrfile}`;
            const options = {
                cwd: acts.projectpath,
            };
            child = child_process.exec(command, options);
        }
        return child;
    }
}
export const langc = new LangC();
