import * as vscode from "vscode";
import * as fs from "fs";
import child_process, { ExecFileSyncOptions } from "child_process";
import { acts } from "../AcTsExtension";
import { IExtension } from "../XExtension";

class Cpp implements IExtension {
    // implements

    // prop
    name = "C++";
    extension = ".cpp";

    // method
    isSelected(): boolean {
        return acts.extension === this.extension;
    }

    // TODO javaに倣って修正
    // TODO ロジックの共通化
    // TODO implementsからextendsに変更
    checkLang(): void {
        const config = vscode.workspace.getConfiguration(acts.appid);
        const cmd = acts.expandString(config.get("c++Checker"));
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
        const config = vscode.workspace.getConfiguration(acts.appid);
        const cmd = acts.expandString(config.get("c++Compiler"));
        const command = `(${cmd}) 1> ${acts.tmptestoutfile} 2> ${acts.tmptesterrfile}`;
        const options = { cwd: acts.projectpath };
        try {
            child_process.execSync(command, options);
        } catch (ex) {
            const err = fs.readFileSync(acts.tmptesterrfile).toString().trim().replace(/\n/g, "\r\n");
            throw `ERROR: compile failed\r\n${err}\r\n`;
        }
    }

    debugTask(): any {
        throw "ERROR: debug is not supported";
    }

    testTask(): any {
        const config = vscode.workspace.getConfiguration(acts.appid);
        const cmd = acts.expandString(config.get("c++Executor"));
        const command = `(${cmd}) < ${acts.tmptestinfile} 1> ${acts.tmptestoutfile} 2> ${acts.tmptesterrfile}`;
        const options = { cwd: acts.projectpath };
        const child = child_process.exec(command, options);
        return child;
    }
}
export const cpp = new Cpp();
