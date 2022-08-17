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
    isSelected(): boolean {
        return acts.extension === this.extension;
    }

    // TODO ロジックの共通化
    // TODO implementsからextendsに変更
    checkLang(): void {
        // throw if non-zero returned
        const config = vscode.workspace.getConfiguration(acts.appid);
        const cmd = acts.expandString(config.get("cChecker"));
        const command = `(${cmd}) 1> ${acts.tmptestoutfile} 2> ${acts.tmptesterrfile}`;
        const options = { cwd: acts.projectpath };
        try {
            child_process.execSync(command, options);
        } catch (ex) {
            const err = fs.readFileSync(acts.tmptesterrfile).toString().trim().replace(/\n/g, "\r\n");
            throw `ERROR: check failed\r\n${err}\r\n`;
        }
    }

    compileTask(): void {
        // throw if non-zero returned
        const config = vscode.workspace.getConfiguration(acts.appid);
        const cmd = acts.expandString(config.get("cCompiler"));
        const command = `(${cmd}) 1> ${acts.tmptestoutfile} 2> ${acts.tmptesterrfile}`;
        const options = { cwd: acts.projectpath };
        try {
            child_process.execSync(command, options);
        } catch (ex) {
            const err = fs.readFileSync(acts.tmptesterrfile).toString().trim().replace(/\n/g, "\r\n");
            throw `ERROR: compile failed\r\n${err}\r\n`;
        }
    }

    testTask(debug: boolean): any {
        let child = null;
        if (debug) {
            throw "ERROR: debug is not supported";
        } else {
            // config
            const config = vscode.workspace.getConfiguration(acts.appid);
            const cmd = acts.expandString(config.get("cExecutor"));
            const command = `(${cmd}) < ${acts.tmptestinfile} 1> ${acts.tmptestoutfile} 2> ${acts.tmptesterrfile}`;
            const options = { cwd: acts.projectpath };
            child = child_process.exec(command, options);
        }
        return child;
    }
}
export const langc = new LangC();
