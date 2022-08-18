import * as vscode from "vscode";
import * as fs from "fs";
import child_process, { ExecFileSyncOptions } from "child_process";
import { acts } from "../AcTsExtension";
import { XExtension } from "../XExtension";

class Java implements XExtension {
    // implements

    // prop
    name = "Java";
    extension = ".java";

    // method
    isSelected(): boolean {
        return acts.extension === this.extension;
    }

    // TODO ロジックの共通化
    // TODO implementsからextendsに変更
    checkLang(): void {
        // check
        const config = vscode.workspace.getConfiguration(acts.appid);
        const cmdchk = String(config.get("javaChecker"));
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
        // modify executable filename
        const tmptaskfile = `${process.env.TEMP}\\${acts.appid}\\Main.java`;
        fs.copyFileSync(acts.taskfile, tmptaskfile);
        acts.taskfile = tmptaskfile;
        acts.tmpexecfile = `${process.env.TEMP}\\${acts.appid}\\Main.class`;

        // compile
        const config = vscode.workspace.getConfiguration(acts.appid);
        const cmdcmp = String(config.get("javaCompiler"));
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
        const cmdexe = String(config.get("javaExecutor"));
        acts.channel.appendLine(`[${acts.timestamp()}] executor: ${cmdexe}`);
    }

    debugTask(): any {
        throw "ERROR: debug is not supported";
    }

    testTask(): any {
        // test
        const config = vscode.workspace.getConfiguration(acts.appid);
        const cmdexe = String(config.get("javaExecutor"));
        const cmdexp = acts.expandString(cmdexe);
        const command = `(${cmdexp}) < ${acts.tmptestinfile} 1> ${acts.tmptestoutfile} 2> ${acts.tmptesterrfile}`;
        const options = { cwd: acts.projectpath };
        const child = child_process.exec(command, options);
        return child;
    }
}
export const java = new Java();
