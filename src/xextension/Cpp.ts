import * as vscode from "vscode";
import * as fs from "fs";
import child_process, { ExecFileSyncOptions } from "child_process";
import { acts } from "../AcTsExtension";
import { IExtension } from "../IExtension";

class Cpp implements IExtension {
    // implements

    // prop
    extension = ".cpp";

    // method
    isSelected(): boolean {
        return acts.extension === this.extension;
    }

    // TODO javaに倣って修正
    // TODO ロジックの共通化
    // TODO implementsからextendsに変更
    checkLang(): void {
        // check
        const cfgkey = "c++Checker";
        const config = vscode.workspace.getConfiguration(acts.appid);
        const cmdchk = String(config.get(cfgkey));
        acts.channel.appendLine(`[${acts.timestamp()}] checker: ${cmdchk}`);
        const cmdexp = acts.expandString(cmdchk);
        const command = `(${cmdexp}) 1> ${acts.tmptestoutfile} 2> ${acts.tmptesterrfile}`;
        const options = { cwd: acts.projectpath };
        try {
            child_process.execSync(command, options);
        } catch (ex) {
            const err = fs.readFileSync(acts.tmptesterrfile).toString().trim().replace(/\n/g, "\r\n");
            throw `ERROR: check failed\r\n${err}\r\n`;
        }
    }

    compileTask(): void {
        // compile
        const cfgkey = "c++Compiler";
        const config = vscode.workspace.getConfiguration(acts.appid);
        const cmdcmp = String(config.get(cfgkey));
        acts.channel.appendLine(`[${acts.timestamp()}] compiler: ${cmdcmp}`);
        const cmdexp = acts.expandString(cmdcmp);
        const command = `(${cmdexp}) 1> ${acts.tmptestoutfile} 2> ${acts.tmptesterrfile}`;
        const options = { cwd: acts.projectpath };
        try {
            child_process.execSync(command, options);
        } catch (ex) {
            const err = fs.readFileSync(acts.tmptesterrfile).toString().trim().replace(/\n/g, "\r\n");
            throw `ERROR: compile failed\r\n${err}\r\n`;
        }

        // show executor
        const cmdexe = String(config.get("cExecutor"));
        acts.channel.appendLine(`[${acts.timestamp()}] executor: ${cmdexe}`);
    }

    debugTask(): any {
        throw "ERROR: debug is not supported";
    }

    testTask(): any {
        // test
        const cfgkey = "c++Executor";
        const config = vscode.workspace.getConfiguration(acts.appid);
        const cmdexe = String(config.get(cfgkey));
        const cmdexp = acts.expandString(cmdexe);
        const command = `(${cmdexp}) < ${acts.tmptestinfile} 1> ${acts.tmptestoutfile} 2> ${acts.tmptesterrfile}`;
        const options = { cwd: acts.projectpath };
        const child = child_process.exec(command, options);
        return child;
    }
}
export const cpp = new Cpp();
